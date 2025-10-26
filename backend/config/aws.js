import dotenv from "dotenv";
dotenv.config();
import { S3Client } from '@aws-sdk/client-s3';
import { TextractClient } from '@aws-sdk/client-textract';
import { ComprehendClient } from '@aws-sdk/client-comprehend';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Initialize AWS clients
export const s3Client = new S3Client(awsConfig);
export const textractClient = new TextractClient(awsConfig);
export const comprehendClient = new ComprehendClient(awsConfig);

const dynamoClient = new DynamoDBClient(awsConfig);
export const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Environment variables
export const AWS_CONFIG = {
  S3_BUCKET: process.env.S3_BUCKET_NAME,
  DYNAMODB_TABLE: process.env.DYNAMODB_TABLE_NAME,
  REGION: process.env.AWS_REGION || 'ap-south-1',
};

// Validate required environment variables
if (!AWS_CONFIG.S3_BUCKET) {
  console.error('❌ ERROR: S3_BUCKET_NAME is not configured in environment variables');
  throw new Error('S3_BUCKET_NAME environment variable is required');
}

if (!AWS_CONFIG.DYNAMODB_TABLE) {
  console.error('❌ ERROR: DYNAMODB_TABLE_NAME is not configured in environment variables');
  throw new Error('DYNAMODB_TABLE_NAME environment variable is required');
}

console.log('✅ AWS Configuration loaded successfully:');
console.log(`   - Region: ${AWS_CONFIG.REGION}`);
console.log(`   - S3 Bucket: ${AWS_CONFIG.S3_BUCKET}`);
console.log(`   - DynamoDB Table: ${AWS_CONFIG.DYNAMODB_TABLE}`);
