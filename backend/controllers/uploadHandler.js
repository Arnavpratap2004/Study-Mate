import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { StartDocumentTextDetectionCommand, GetDocumentTextDetectionCommand } from '@aws-sdk/client-textract';
import { DetectKeyPhrasesCommand, DetectDominantLanguageCommand } from '@aws-sdk/client-comprehend';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { s3Client, textractClient, comprehendClient, docClient, AWS_CONFIG } from '../config/aws.js';

export const uploadHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileId = uuidv4();
    const s3Key = `pdfs/${fileId}-${file.originalname}`;

    console.log(`Processing file: ${file.originalname}, Size: ${file.size} bytes`);

    // Step 1: Upload PDF to S3
    const uploadParams = {
      Bucket: AWS_CONFIG.S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`File uploaded to S3: ${s3Key}`);

    // Generate presigned URL for frontend access
    const getObjectParams = {
      Bucket: AWS_CONFIG.S3_BUCKET,
      Key: s3Key,
    };
    const s3Url = await getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), { expiresIn: 3600 });

    // Step 2: Extract text using Textract (Asynchronous API for PDFs)
    console.log('Starting Textract document text detection...');
    
    const startTextractParams = {
      DocumentLocation: {
        S3Object: {
          Bucket: AWS_CONFIG.S3_BUCKET,
          Name: s3Key,
        },
      },
    };

    // Add SNS notification configuration if available
    if (process.env.TEXTRACT_SNS_TOPIC_ARN && process.env.TEXTRACT_ROLE_ARN) {
      startTextractParams.NotificationChannel = {
        SNSTopicArn: process.env.TEXTRACT_SNS_TOPIC_ARN,
        RoleArn: process.env.TEXTRACT_ROLE_ARN,
      };
    }

    const startTextractResponse = await textractClient.send(new StartDocumentTextDetectionCommand(startTextractParams));
    const jobId = startTextractResponse.JobId;
    console.log(`Textract job started with JobId: ${jobId}`);

    // Poll for job completion
    let extractedText = '';
    let jobStatus = 'IN_PROGRESS';
    let attempts = 0;
    const maxAttempts = 60; // Wait up to 60 seconds

    while (jobStatus === 'IN_PROGRESS' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;

      const getResultParams = { JobId: jobId };
      const getResultResponse = await textractClient.send(new GetDocumentTextDetectionCommand(getResultParams));
      jobStatus = getResultResponse.JobStatus;

      if (jobStatus === 'SUCCEEDED') {
        console.log('Textract job completed successfully');
        
        // Extract text from all pages
        const blocks = getResultResponse.Blocks || [];
        extractedText = blocks
          .filter(block => block.BlockType === 'LINE')
          .map(block => block.Text)
          .join(' ');

        // Handle pagination if there are multiple pages
        let nextToken = getResultResponse.NextToken;
        while (nextToken) {
          const nextPageParams = { JobId: jobId, NextToken: nextToken };
          const nextPageResponse = await textractClient.send(new GetDocumentTextDetectionCommand(nextPageParams));
          
          const nextBlocks = nextPageResponse.Blocks || [];
          const nextText = nextBlocks
            .filter(block => block.BlockType === 'LINE')
            .map(block => block.Text)
            .join(' ');
          
          extractedText += ' ' + nextText;
          nextToken = nextPageResponse.NextToken;
        }

        console.log(`Extracted text length: ${extractedText.length} characters`);
      } else if (jobStatus === 'FAILED') {
        throw new Error('Textract job failed');
      }
    }

    if (jobStatus === 'IN_PROGRESS') {
      throw new Error('Textract job timed out');
    }

    // Step 3: Extract keywords and topics using Comprehend
    let keywords = [];
    let topics = [];

    if (extractedText.length > 0) {
      // Detect language first
      const languageParams = {
        Text: extractedText.substring(0, 5000), // Comprehend has text length limits
      };
      
      const languageResponse = await comprehendClient.send(new DetectDominantLanguageCommand(languageParams));
      const dominantLanguage = languageResponse.Languages[0]?.LanguageCode || 'en';

      // Extract key phrases (keywords)
      const keyPhrasesParams = {
        Text: extractedText.substring(0, 5000),
        LanguageCode: dominantLanguage,
      };

      const keyPhrasesResponse = await comprehendClient.send(new DetectKeyPhrasesCommand(keyPhrasesParams));
      
      keywords = keyPhrasesResponse.KeyPhrases
        .filter(phrase => phrase.Score > 0.8) // Only high-confidence keywords
        .map(phrase => phrase.Text.toLowerCase())
        .slice(0, 20); // Limit to top 20 keywords

      // For topics, we'll use the top keywords as topics for MVP
      topics = keywords.slice(0, 10);
    }

    console.log(`Extracted ${keywords.length} keywords and ${topics.length} topics`);

    // Step 4: Store metadata in DynamoDB
    const dynamoParams = {
      TableName: AWS_CONFIG.DYNAMODB_TABLE,
      Item: {
        fileId: fileId,
        fileName: file.originalname,
        s3Url: s3Url,
        s3Key: s3Key,
        keywords: keywords,
        topics: topics,
        uploadDate: new Date().toISOString(),
        fileSize: file.size,
        extractedTextLength: extractedText.length,
      },
    };

    await docClient.send(new PutCommand(dynamoParams));
    console.log(`Metadata stored in DynamoDB for fileId: ${fileId}`);

    // Return success response
    res.status(200).json({
      fileId: fileId,
      fileName: file.originalname,
      s3Url: s3Url,
      keywords: keywords,
      topics: topics,
      message: 'File uploaded and processed successfully',
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process file';
    let statusCode = 500;
    
    if (error.name === 'AccessDeniedException') {
      errorMessage = 'AWS permissions error. Please check IAM permissions for Textract.';
      statusCode = 403;
    } else if (error.name === 'InvalidS3ObjectException') {
      errorMessage = 'Invalid S3 object. Please ensure the file was uploaded correctly.';
      statusCode = 400;
    } else if (error.message?.includes('Textract')) {
      errorMessage = 'Text extraction failed. The PDF might be corrupted or in an unsupported format.';
    } else if (error.message?.includes('Comprehend')) {
      errorMessage = 'Keyword extraction failed. The document might not contain enough text.';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
