# AWS Setup Guide for Smart Study Material Organizer

This guide will walk you through setting up all the required AWS services for the Smart Study Material Organizer MVP.

## Prerequisites

1. **AWS Account**: You need an active AWS account
2. **AWS CLI**: Install and configure AWS CLI (optional but recommended)
3. **IAM User**: Create an IAM user with programmatic access

## Step 1: Create IAM User and Get Credentials

### 1.1 Create IAM User
1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. Username: `study-mate-user`
4. Select "Programmatic access"
5. Click "Next: Permissions"

### 1.2 Attach Policies
Attach the following AWS managed policies:
- `AmazonS3FullAccess`
- `AmazonTextractFullAccess`
- `ComprehendFullAccess`
- `AmazonDynamoDBFullAccess`

**Note**: For production, create custom policies with minimal required permissions.

### 1.3 Get Access Keys
1. Complete user creation
2. **IMPORTANT**: Save the Access Key ID and Secret Access Key
3. Update your backend `.env` file:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

## Step 2: Create S3 Bucket

### 2.1 Create Bucket
1. Go to AWS Console → S3
2. Click "Create bucket"
3. **Bucket name**: `study-mate-pdfs` (must be globally unique, so add a suffix like `-your-name`)
4. **Region**: `us-east-1` (or your preferred region)
5. **Block Public Access**: Keep default settings (block all public access)
6. Click "Create bucket"

### 2.2 Update Configuration
Update your backend `.env` file:
```env
S3_BUCKET_NAME=study-mate-pdfs-your-suffix
```

### 2.3 Configure CORS (Optional)
If you plan to upload directly from frontend:
1. Go to your bucket → Permissions → CORS
2. Add this configuration:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"],
        "ExposeHeaders": []
    }
]
```

## Step 3: Create DynamoDB Table

### 3.1 Create Table
1. Go to AWS Console → DynamoDB → Tables
2. Click "Create table"
3. **Table name**: `study-mate-files`
4. **Partition key**: `fileId` (String)
5. Leave other settings as default
6. Click "Create table"

### 3.2 Update Configuration
Update your backend `.env` file:
```env
DYNAMODB_TABLE_NAME=study-mate-files
```

## Step 4: Enable AWS Services

### 4.1 Amazon Textract
- Textract is available by default in most regions
- No additional setup required
- **Supported regions**: us-east-1, us-east-2, us-west-2, eu-west-1, etc.

### 4.2 Amazon Comprehend
- Comprehend is available by default in most regions
- No additional setup required
- **Supported regions**: us-east-1, us-east-2, us-west-2, eu-west-1, etc.

## Step 5: Test AWS Configuration

### 5.1 Install Backend Dependencies
```bash
cd backend
npm install
```

### 5.2 Test Connection
Create a test script `test-aws.js` in your backend folder:

```javascript
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
```

Run the test:
```bash
node test-aws.js
```

## Step 6: Environment Configuration Summary

Your final backend `.env` file should look like:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# AWS Services
S3_BUCKET_NAME=study-mate-pdfs-your-suffix
DYNAMODB_TABLE_NAME=study-mate-files
```

## Step 7: Start the Application

### 7.1 Start Backend
```bash
cd backend
npm start
```

### 7.2 Start Frontend
```bash
cd frontend
npm run dev
```

### 7.3 Test the Application
1. Open http://localhost:5173
2. Try uploading a PDF file
3. Check if keywords are extracted
4. Test the search functionality

## Troubleshooting

### Common Issues

1. **Access Denied Errors**
   - Check IAM permissions
   - Verify access keys are correct
   - Ensure region matches

2. **Bucket Not Found**
   - Verify bucket name in .env
   - Check bucket region
   - Ensure bucket exists

3. **Table Not Found**
   - Verify table name in .env
   - Check table region
   - Ensure table is created

4. **Textract/Comprehend Errors**
   - Check if services are available in your region
   - Verify IAM permissions
   - Check file size limits (Textract: 10MB, Comprehend: 5000 chars)

### Service Limits

- **S3**: 5TB per object max
- **Textract**: 10MB per document
- **Comprehend**: 5000 characters per request
- **DynamoDB**: 25 GB free tier

### Cost Optimization

1. **S3**: Use lifecycle policies to move old files to cheaper storage
2. **DynamoDB**: Use on-demand billing for development
3. **Textract/Comprehend**: Monitor usage to avoid unexpected charges

## Security Best Practices

1. **Never commit AWS credentials to git**
2. **Use IAM roles in production instead of access keys**
3. **Enable CloudTrail for audit logging**
4. **Set up billing alerts**
5. **Use least privilege principle for IAM policies**

## Next Steps

Once everything is working:
1. Set up proper IAM roles for production
2. Configure CloudFront for S3 distribution
3. Set up API Gateway and Lambda for serverless deployment
4. Implement proper error handling and logging
5. Add monitoring with CloudWatch

## Support

If you encounter issues:
1. Check AWS CloudWatch logs
2. Review IAM permissions
3. Verify service availability in your region
4. Check AWS service status page
