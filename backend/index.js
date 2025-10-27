import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { uploadHandler } from "./controllers/uploadHandler.js";
import { searchHandler, getAllFilesHandler } from "./controllers/searchHandler.js";
import upload from "./utils/multer.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/api", (req, res) => {
  res.json({ 
    message: "Smart Study Material Organizer API",
    version: "1.0.0",
    endpoints: {
      upload: "POST /api/upload",
      search: "GET /api/search?keyword=<keyword>",
      files: "GET /api/files"
    }
  });
});

// Upload endpoint - accepts PDF files
app.post("/api/upload", upload.single('pdf'), uploadHandler);

// Search endpoint - search by keyword
app.get("/api/search", searchHandler);

// Get all files endpoint (for debugging/admin)
app.get("/api/files", getAllFilesHandler);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      s3Bucket: process.env.S3_BUCKET_NAME ? 'configured' : 'not configured',
      dynamoTable: process.env.DYNAMODB_TABLE_NAME ? 'configured' : 'not configured'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 Smart Study Material Organizer API`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});