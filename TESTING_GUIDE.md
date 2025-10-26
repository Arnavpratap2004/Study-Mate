# 🧪 Study Mate - Complete Testing Guide

This guide will walk you through testing the entire Study Mate application, from backend to frontend.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- ✅ Node.js (v18 or higher)
- ✅ npm (comes with Node.js)
- ✅ AWS Account with configured services
- ✅ Git (optional, for version control)

### AWS Services Setup
Before testing, ensure these AWS services are configured:
- ✅ S3 Bucket: `study-mate-pdfs`
- ✅ DynamoDB Table: `study-mate-files`
- ✅ IAM User with proper permissions (see `AWS_SETUP.md`)

---

## 🔧 Backend Testing

### Step 1: Navigate to Backend Directory
```bash
cd c:\Users\Arnav\Desktop\study-mate\backend
```

### Step 2: Verify Dependencies
Check if `node_modules` exists. If not, install dependencies:
```bash
npm install
```

### Step 3: Verify Environment Variables
Open `.env` file and ensure all variables are set:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY

# AWS Services
S3_BUCKET_NAME=study-mate-pdfs
DYNAMODB_TABLE_NAME=study-mate-files
```

### Step 4: Test AWS Connection
Run the AWS connection test script:
```bash
node test-aws.js
```

**Expected Output:**
```
✅ S3 Connection successful
Buckets: [ 'study-mate-pdfs', ... ]
✅ DynamoDB Connection successful
Tables: [ 'study-mate-files', ... ]
```

**If you see errors:**
- ❌ Check your AWS credentials in `.env`
- ❌ Verify IAM permissions
- ❌ Ensure S3 bucket and DynamoDB table exist

### Step 5: Start Backend Server
```bash
npm start
```

**Expected Output:**
```
✅ AWS Configuration loaded successfully:
   - Region: ap-south-1
   - S3 Bucket: study-mate-pdfs
   - DynamoDB Table: study-mate-files
🚀 Server is running on http://localhost:5000
📚 Smart Study Material Organizer API
🔍 Health check: http://localhost:5000/health
```

### Step 6: Test Backend Endpoints

#### Test 1: Health Check
Open a new terminal and run:
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-26T16:44:37.123Z",
  "environment": {
    "nodeEnv": "development",
    "awsRegion": "ap-south-1",
    "s3Bucket": "configured",
    "dynamoTable": "configured"
  }
}
```

#### Test 2: Root Endpoint
```bash
curl http://localhost:5000/
```

**Expected Response:**
```json
{
  "message": "Smart Study Material Organizer API",
  "version": "1.0.0",
  "endpoints": {
    "upload": "POST /upload",
    "search": "GET /search?keyword=<keyword>",
    "files": "GET /files"
  }
}
```

#### Test 3: Upload Endpoint (using PowerShell)
```powershell
$file = "C:\path\to\your\test.pdf"
curl.exe -X POST http://localhost:5000/upload -F "pdf=@$file"
```

**Expected Response (after 10-30 seconds):**
```json
{
  "fileId": "uuid-here",
  "fileName": "test.pdf",
  "s3Url": "https://...",
  "keywords": ["keyword1", "keyword2", ...],
  "topics": ["topic1", "topic2", ...],
  "message": "File uploaded and processed successfully"
}
```

#### Test 4: Search Endpoint
```bash
curl "http://localhost:5000/search?keyword=aws"
```

**Expected Response:**
```json
{
  "keyword": "aws",
  "totalResults": 1,
  "results": [
    {
      "fileId": "uuid-here",
      "fileName": "test.pdf",
      "s3Url": "https://...",
      "keywords": [...],
      "topics": [...],
      "uploadDate": "2025-10-26T...",
      "fileSize": 217167
    }
  ]
}
```

#### Test 5: Get All Files
```bash
curl http://localhost:5000/files
```

**Expected Response:**
```json
{
  "totalFiles": 1,
  "files": [...]
}
```

### ✅ Backend Testing Checklist
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] AWS connection test passed
- [ ] Server starts without errors
- [ ] Health check endpoint works
- [ ] Root endpoint returns API info
- [ ] Upload endpoint accepts PDF files
- [ ] Search endpoint returns results
- [ ] Files endpoint lists all files

---

## 🎨 Frontend Testing

### Step 1: Navigate to Frontend Directory
Open a **NEW terminal** (keep backend running) and run:
```bash
cd c:\Users\Arnav\Desktop\study-mate\frontend
```

### Step 2: Verify Dependencies
Check if `node_modules` exists. If not, install dependencies:
```bash
npm install
```

### Step 3: Verify Environment Variables
Open `.env` file and ensure it points to your backend:
```env
VITE_API_URL=http://localhost:5000
```

### Step 4: Start Frontend Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v7.1.7  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 5: Open Application in Browser
1. Open your browser
2. Navigate to: `http://localhost:5173`
3. You should see the Study Mate application

### Step 6: Test Frontend UI

#### Test 1: Upload Tab
1. Click on the **"Upload"** tab (should be active by default)
2. You should see:
   - Header: "📚 Upload PDF Document"
   - File input button: "Choose PDF file..."
   - Upload button (disabled until file is selected)

#### Test 2: Search Tab
1. Click on the **"Search"** tab
2. You should see:
   - Header: "🔍 Search Study Materials"
   - Search input field
   - Search button

### ✅ Frontend Testing Checklist
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Development server starts
- [ ] Application loads in browser
- [ ] Upload tab is visible
- [ ] Search tab is visible
- [ ] UI looks clean and professional

---

## 🔄 End-to-End Testing

Now let's test the complete workflow from upload to search!

### Test Scenario 1: Upload a PDF

#### Step 1: Prepare a Test PDF
Use your "AWS Trusted Advisor (1).pdf" or any other PDF file.

#### Step 2: Upload via UI
1. Go to `http://localhost:5173`
2. Click **"Upload"** tab
3. Click **"Choose PDF file..."**
4. Select your PDF file
5. Verify file info appears (name and size)
6. Click **"Upload & Process"** button

#### Step 3: Monitor Progress
**In the browser:**
- Button should show "Processing..." with a spinner
- This may take 10-60 seconds (Textract processing time)

**In the backend terminal, you should see:**
```
Processing file: AWS Trusted Advisor (1).pdf, Size: 217167 bytes
File uploaded to S3: pdfs/uuid-filename.pdf
Starting Textract document text detection...
Textract job started with JobId: abc123...
Textract job completed successfully
Extracted text length: 5432 characters
Extracted 15 keywords and 10 topics
Metadata stored in DynamoDB for fileId: uuid
```

#### Step 4: Verify Success
After processing completes, you should see:
- ✅ Green success message: "Upload Successful!"
- File details (name, ID, keyword count, topic count)
- Preview of top keywords as tags
- "📄 View PDF" link

#### Step 5: Click "View PDF"
- Should open the PDF in a new tab
- PDF should be viewable (presigned S3 URL)

### Test Scenario 2: Search for Files

#### Step 1: Switch to Search Tab
1. Click the **"Search"** tab

#### Step 2: Search by Keyword
1. Enter a keyword from your uploaded PDF (e.g., "aws", "advisor", "trusted")
2. Click **"Search"** button

#### Step 3: Verify Results
You should see:
- Search results header: "Search Results for 'aws' (1 found)"
- Result card with:
  - 📄 File name
  - File size and upload date
  - Keywords tags
  - Topics tags
  - "📖 View PDF" button

#### Step 4: Test Multiple Searches
Try different keywords:
- Keywords that exist in the PDF (should return results)
- Keywords that don't exist (should show "No files found")
- Partial keywords (should still match)

### Test Scenario 3: Upload Multiple Files

#### Step 1: Upload 2-3 Different PDFs
Repeat the upload process with different PDF files on different topics.

#### Step 2: Search for Common Keywords
Search for keywords that might appear in multiple files.

#### Step 3: Verify Multiple Results
- Should see multiple result cards
- Each with different file names and keywords
- All "View PDF" links should work

### ✅ End-to-End Testing Checklist
- [ ] Can upload a PDF successfully
- [ ] Upload shows processing status
- [ ] Success message appears after upload
- [ ] Keywords and topics are extracted
- [ ] View PDF link works
- [ ] Can search for uploaded files
- [ ] Search returns correct results
- [ ] Can upload multiple files
- [ ] Search works across multiple files
- [ ] No errors in browser console
- [ ] No errors in backend terminal

---

## 🐛 Troubleshooting

### Backend Issues

#### Issue: "S3_BUCKET_NAME is not configured"
**Solution:**
1. Check `.env` file exists in backend folder
2. Verify `S3_BUCKET_NAME=study-mate-pdfs` is set
3. Restart the backend server

#### Issue: "AccessDeniedException" when uploading
**Solution:**
1. Check IAM user permissions
2. Ensure user has `textract:StartDocumentTextDetection` permission
3. See `AWS_SETUP.md` for required permissions

#### Issue: "Textract job timed out"
**Solution:**
1. PDF might be too large or complex
2. Try a smaller PDF (< 5 pages)
3. Check AWS Textract service status

#### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Frontend Issues

#### Issue: "Failed to fetch" or CORS error
**Solution:**
1. Ensure backend is running on port 5000
2. Check `VITE_API_URL` in frontend `.env`
3. Verify CORS is enabled in backend

#### Issue: "Port 5173 already in use"
**Solution:**
```bash
# Kill the process
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or Vite will automatically use next available port
```

#### Issue: Upload button stays disabled
**Solution:**
1. Ensure you selected a PDF file (not other formats)
2. Check file size is < 10MB
3. Check browser console for errors

### AWS Issues

#### Issue: "Bucket does not exist"
**Solution:**
```bash
# Create the bucket
aws s3 mb s3://study-mate-pdfs --region ap-south-1
```

#### Issue: "Table does not exist"
**Solution:**
```bash
# Create the DynamoDB table
aws dynamodb create-table \
    --table-name study-mate-files \
    --attribute-definitions AttributeName=fileId,AttributeType=S \
    --key-schema AttributeName=fileId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region ap-south-1
```

---

## 📊 Testing Checklist Summary

### Pre-Testing
- [ ] Node.js installed
- [ ] AWS services configured
- [ ] IAM permissions set

### Backend
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] AWS connection verified
- [ ] Server starts successfully
- [ ] All endpoints respond

### Frontend
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Dev server starts
- [ ] UI loads correctly

### End-to-End
- [ ] Can upload PDFs
- [ ] Text extraction works
- [ ] Keywords extracted
- [ ] Can search files
- [ ] Results display correctly
- [ ] View PDF links work

---

## 🎉 Success Criteria

Your application is working correctly if:
1. ✅ Backend server starts without errors
2. ✅ Frontend loads in browser
3. ✅ Can upload a PDF file
4. ✅ File appears in S3 bucket
5. ✅ Metadata stored in DynamoDB
6. ✅ Keywords and topics extracted
7. ✅ Can search and find uploaded files
8. ✅ Can view PDFs via presigned URLs

---

## 📝 Notes

- **Processing Time**: PDF processing takes 10-60 seconds depending on file size
- **File Limits**: Maximum 10MB per file (configurable in `utils/multer.js`)
- **Presigned URLs**: S3 URLs expire after 1 hour (configurable in `uploadHandler.js`)
- **Cost**: Each upload costs ~$0.0015 (Textract) + storage costs

---

## 🆘 Need Help?

If you encounter issues:
1. Check backend terminal for error messages
2. Check browser console (F12) for frontend errors
3. Verify AWS services are running
4. Review `AWS_SETUP.md` for configuration help
5. Check CloudWatch logs in AWS Console

Happy Testing! 🚀
