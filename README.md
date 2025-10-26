# 🎓 Smart Study Material Organizer

An intelligent MVP application that helps students and researchers organize their PDF study materials by automatically extracting keywords and topics using AWS AI services.

## ✨ Features

- **📤 PDF Upload**: Upload PDF documents with drag-and-drop interface
- **🤖 AI-Powered Processing**: Automatic text extraction using AWS Textract
- **🔍 Keyword Extraction**: Smart keyword and topic identification using AWS Comprehend
- **🔎 Intelligent Search**: Search through your documents by keywords, topics, or filename
- **☁️ Cloud Storage**: Secure storage using AWS S3
- **📊 Metadata Management**: Organized document metadata in DynamoDB

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Axios** for API communication
- Modern CSS with responsive design

### Backend
- **Node.js** with Express
- **AWS SDK v3** for cloud services
- **Multer** for file uploads
- **CORS** enabled for cross-origin requests

### AWS Services
- **S3** - PDF storage
- **Textract** - Text extraction from PDFs
- **Comprehend** - Keyword and topic extraction
- **DynamoDB** - Metadata storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- AWS account with configured services
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd study-mate
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Configure your `.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# AWS Services
S3_BUCKET_NAME=your-s3-bucket-name
DYNAMODB_TABLE_NAME=study-mate-files
```

Start the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. AWS Services Setup
Follow the detailed [AWS Setup Guide](./AWS_SETUP_GUIDE.md) to configure:
- IAM user with proper permissions
- S3 bucket for PDF storage
- DynamoDB table for metadata
- Enable Textract and Comprehend services

## 📖 Usage

### Uploading Documents
1. Navigate to the Upload tab
2. Select or drag-and-drop a PDF file (max 10MB)
3. Click "Upload & Process"
4. Wait for AI processing to complete
5. View extracted keywords and topics

### Searching Documents
1. Navigate to the Search tab
2. Enter keywords, topics, or filename
3. Browse through matching results
4. Click "View PDF" to open documents

## 🏗️ Project Structure

```
study-mate/
├── backend/
│   ├── config/
│   │   └── aws.js              # AWS service configuration
│   ├── controllers/
│   │   ├── uploadHandler.js    # PDF upload and processing
│   │   └── searchHandler.js    # Search functionality
│   ├── utils/
│   │   └── multer.js          # File upload middleware
│   ├── .env                   # Environment variables
│   ├── index.js              # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx     # App header with navigation
│   │   │   ├── Upload.tsx     # PDF upload component
│   │   │   └── Search.tsx     # Search component
│   │   ├── services/
│   │   │   └── api.ts         # API service layer
│   │   ├── App.tsx           # Main app component
│   │   ├── App.css           # Styles
│   │   └── main.tsx          # Entry point
│   ├── .env                  # Frontend environment
│   └── package.json
├── AWS_SETUP_GUIDE.md        # Detailed AWS setup instructions
└── README.md                 # This file
```

## 🔧 API Endpoints

### POST /upload
Upload and process a PDF file
- **Body**: multipart/form-data with 'pdf' field
- **Response**: File metadata with extracted keywords and topics

### GET /search?keyword={keyword}
Search for documents by keyword
- **Query**: keyword string
- **Response**: Array of matching documents with metadata

### GET /files
Get all uploaded files (admin/debug endpoint)
- **Response**: Array of all documents with metadata

### GET /health
Health check endpoint
- **Response**: Server status and configuration

## 🎨 Features in Detail

### AI-Powered Text Extraction
- Uses AWS Textract to extract text from PDF documents
- Handles various PDF formats and layouts
- Processes documents up to 10MB in size

### Smart Keyword Detection
- Leverages AWS Comprehend for natural language processing
- Extracts high-confidence keywords and key phrases
- Identifies dominant topics automatically
- Supports multiple languages

### Intelligent Search
- Search by keywords, topics, or filename
- Case-insensitive matching
- Results sorted by relevance and upload date
- Real-time search with instant results

### Modern UI/UX
- Responsive design for all devices
- Drag-and-drop file upload
- Loading states and error handling
- Clean, intuitive interface

## 🔒 Security Considerations

- AWS credentials stored in environment variables
- CORS configured for specific origins
- File type validation (PDF only)
- File size limits enforced
- Presigned URLs for secure S3 access

## 📊 Monitoring and Debugging

### Health Check
Visit `http://localhost:5000/health` to check:
- Server status
- AWS service configuration
- Environment settings

### Logs
- Backend logs all operations to console
- AWS service calls are logged
- Error details provided in development mode

## 🚀 Deployment Options

### Option 1: Traditional Server
- Deploy backend to EC2, Heroku, or similar
- Deploy frontend to Netlify, Vercel, or S3+CloudFront
- Update CORS settings for production domains

### Option 2: Serverless (Future Enhancement)
- Convert to AWS Lambda functions
- Use API Gateway for routing
- Deploy frontend to S3+CloudFront

## 🔮 Future Enhancements

- [ ] Document summarization
- [ ] OCR for scanned documents
- [ ] Document categorization
- [ ] User authentication
- [ ] Document sharing
- [ ] Advanced search filters
- [ ] Document annotations
- [ ] Mobile app
- [ ] Batch upload
- [ ] Document versioning

## 🐛 Troubleshooting

### Common Issues

1. **Upload fails**: Check AWS credentials and S3 bucket permissions
2. **No keywords extracted**: Verify Comprehend service availability
3. **Search returns no results**: Check DynamoDB table and data
4. **CORS errors**: Update backend CORS configuration

### Debug Steps
1. Check `/health` endpoint
2. Review browser console for errors
3. Check backend logs
4. Verify AWS service status
5. Test AWS credentials with AWS CLI

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review AWS setup guide
3. Check existing GitHub issues
4. Create a new issue with detailed information

---

**Happy studying! 📚✨**
