import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { docClient, s3Client, AWS_CONFIG } from '../config/aws.js';

export const searchHandler = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({ error: 'Keyword parameter is required' });
    }

    const searchKeyword = keyword.toLowerCase().trim();
    console.log(`Searching for keyword: "${searchKeyword}"`);

    // Scan DynamoDB table for matching keywords or topics
    const scanParams = {
      TableName: AWS_CONFIG.DYNAMODB_TABLE,
    };

    const result = await docClient.send(new ScanCommand(scanParams));
    
    // Filter results based on keyword match in keywords or topics arrays
    const matchingFiles = result.Items.filter(item => {
      const keywordMatch = item.keywords && item.keywords.some(k => 
        k.toLowerCase().includes(searchKeyword)
      );
      const topicMatch = item.topics && item.topics.some(t => 
        t.toLowerCase().includes(searchKeyword)
      );
      const fileNameMatch = item.fileName && 
        item.fileName.toLowerCase().includes(searchKeyword);
      
      return keywordMatch || topicMatch || fileNameMatch;
    });

    console.log(`Found ${matchingFiles.length} matching files`);

    // Generate fresh presigned URLs for matched files
    const resultsWithUrls = await Promise.all(
      matchingFiles.map(async (file) => {
        try {
          // Generate a fresh presigned URL
          const getObjectParams = {
            Bucket: AWS_CONFIG.S3_BUCKET,
            Key: file.s3Key,
          };
          const freshS3Url = await getSignedUrl(
            s3Client, 
            new GetObjectCommand(getObjectParams), 
            { expiresIn: 3600 }
          );

          return {
            fileId: file.fileId,
            fileName: file.fileName,
            s3Url: freshS3Url,
            keywords: file.keywords || [],
            topics: file.topics || [],
            uploadDate: file.uploadDate,
            fileSize: file.fileSize,
          };
        } catch (urlError) {
          console.error(`Error generating URL for file ${file.fileId}:`, urlError);
          return {
            fileId: file.fileId,
            fileName: file.fileName,
            s3Url: null,
            keywords: file.keywords || [],
            topics: file.topics || [],
            uploadDate: file.uploadDate,
            fileSize: file.fileSize,
            error: 'Could not generate download URL',
          };
        }
      })
    );

    // Sort results by upload date (newest first)
    resultsWithUrls.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.status(200).json({
      keyword: searchKeyword,
      totalResults: resultsWithUrls.length,
      results: resultsWithUrls,
    });

  } catch (error) {
    console.error('Search handler error:', error);
    res.status(500).json({ 
      error: 'Failed to search files',
      details: error.message 
    });
  }
};

// Additional endpoint to get all files (for debugging/admin purposes)
export const getAllFilesHandler = async (req, res) => {
  try {
    const scanParams = {
      TableName: AWS_CONFIG.DYNAMODB_TABLE,
    };

    const result = await docClient.send(new ScanCommand(scanParams));
    
    // Generate fresh presigned URLs for all files
    const filesWithUrls = await Promise.all(
      result.Items.map(async (file) => {
        try {
          const getObjectParams = {
            Bucket: AWS_CONFIG.S3_BUCKET,
            Key: file.s3Key,
          };
          const freshS3Url = await getSignedUrl(
            s3Client, 
            new GetObjectCommand(getObjectParams), 
            { expiresIn: 3600 }
          );

          return {
            fileId: file.fileId,
            fileName: file.fileName,
            s3Url: freshS3Url,
            keywords: file.keywords || [],
            topics: file.topics || [],
            uploadDate: file.uploadDate,
            fileSize: file.fileSize,
          };
        } catch (urlError) {
          console.error(`Error generating URL for file ${file.fileId}:`, urlError);
          return {
            fileId: file.fileId,
            fileName: file.fileName,
            s3Url: null,
            keywords: file.keywords || [],
            topics: file.topics || [],
            uploadDate: file.uploadDate,
            fileSize: file.fileSize,
            error: 'Could not generate download URL',
          };
        }
      })
    );

    // Sort by upload date (newest first)
    filesWithUrls.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.status(200).json({
      totalFiles: filesWithUrls.length,
      files: filesWithUrls,
    });

  } catch (error) {
    console.error('Get all files error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve files',
      details: error.message 
    });
  }
};
