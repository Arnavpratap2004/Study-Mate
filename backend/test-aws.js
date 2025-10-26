import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const testAWS = async () => {
  try {
    // Test S3
    const s3 = new S3Client({ 
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });
    
    const s3Response = await s3.send(new ListBucketsCommand({}));
    console.log('✅ S3 Connection successful');
    console.log('Buckets:', s3Response.Buckets.map(b => b.Name));
    
    // Test DynamoDB
    const dynamo = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });
    
    const dynamoResponse = await dynamo.send(new ListTablesCommand({}));
    console.log('✅ DynamoDB Connection successful');
    console.log('Tables:', dynamoResponse.TableNames);
    
  } catch (error) {
    console.error('❌ AWS Connection failed:', error.message);
  }
};

testAWS();