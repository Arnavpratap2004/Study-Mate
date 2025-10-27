import React, { useState } from 'react';
import { uploadPDF, type UploadResponse } from '../services/api';

interface UploadProps {
  onUploadSuccess?: (result: UploadResponse) => void;
}

const Upload: React.FC<UploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllKeywords, setShowAllKeywords] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadPDF(selectedFile);
      setUploadResult(result);
      onUploadSuccess?.(result);
      
      // Reset file input
      setSelectedFile(null);
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      <h2>📤 Upload Your Study Material</h2>
      
      <div className="upload-form">
        <div className="file-input-container">
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={uploading}
            className="file-input"
          />
          <label htmlFor="pdf-upload" className="file-input-label">
            {selectedFile ? (
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedFile.name}</span>
            ) : (
              <>
                <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                  Drop your PDF here or click to browse
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Maximum file size: 10MB
                </span>
              </>
            )}
          </label>
        </div>

        {selectedFile && (
          <div className="file-info">
            <p><strong>File:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="upload-button"
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            'Upload & Process'
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {uploadResult && (
        <div className="success-message">
          <h3>✅ Upload Successful!</h3>
          <div className="upload-details">
            <p><strong>File:</strong> {uploadResult.fileName}</p>
            <p><strong>File ID:</strong> {uploadResult.fileId}</p>
            <p><strong>Keywords Found:</strong> {uploadResult.keywords.length}</p>
            <p><strong>Topics Found:</strong> {uploadResult.topics.length}</p>
            
            {uploadResult.keywords.length > 0 && (
              <div className="keywords-preview">
                <strong>Keywords:</strong>
                <div className="tags">
                  {(showAllKeywords ? uploadResult.keywords : uploadResult.keywords.slice(0, 10)).map((keyword, index) => (
                    <span key={index} className="tag keyword-tag">{keyword}</span>
                  ))}
                  {uploadResult.keywords.length > 10 && (
                    <button
                      className="tag more-tag expandable"
                      onClick={() => setShowAllKeywords(!showAllKeywords)}
                      aria-label={showAllKeywords ? 'Show less keywords' : 'Show more keywords'}
                    >
                      {showAllKeywords ? '− Show less' : `+${uploadResult.keywords.length - 10} more`}
                    </button>
                  )}
                </div>
              </div>
            )}

            <a 
              href={uploadResult.s3Url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="download-link"
            >
              📄 View PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
