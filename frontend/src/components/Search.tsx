import React, { useState } from 'react';
import { searchFiles, type SearchResponse, type SearchResult } from '../services/api.ts';

const Search: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      setError('Please enter a keyword to search');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const results = await searchFiles(keyword.trim());
      setSearchResults(results);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'Failed to search files. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ResultCard: React.FC<{ result: SearchResult }> = ({ result }) => (
    <div className="result-card">
      <div className="result-header">
        <h3 className="result-title">📄 {result.fileName}</h3>
        <div className="result-meta">
          <span className="file-size">{formatFileSize(result.fileSize)}</span>
          <span className="upload-date">{formatDate(result.uploadDate)}</span>
        </div>
      </div>

      <div className="result-content">
        {result.keywords.length > 0 && (
          <div className="keywords-section">
            <strong>Keywords:</strong>
            <div className="tags">
              {result.keywords.slice(0, 8).map((keyword, index) => (
                <span key={index} className="tag keyword-tag">{keyword}</span>
              ))}
              {result.keywords.length > 8 && (
                <span className="tag more-tag">+{result.keywords.length - 8} more</span>
              )}
            </div>
          </div>
        )}

        {result.topics.length > 0 && (
          <div className="topics-section">
            <strong>Topics:</strong>
            <div className="tags">
              {result.topics.slice(0, 5).map((topic, index) => (
                <span key={index} className="tag topic-tag">{topic}</span>
              ))}
              {result.topics.length > 5 && (
                <span className="tag more-tag">+{result.topics.length - 5} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="result-actions">
        {result.s3Url ? (
          <a 
            href={result.s3Url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="view-button"
          >
            📖 View PDF
          </a>
        ) : (
          <span className="error-text">❌ File not available</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="search-container">
      <h2>🔍 Search Study Materials</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keyword to search (e.g., 'mathematics', 'algorithm', 'history')..."
            disabled={searching}
            className="search-input"
          />
          <button
            type="submit"
            disabled={searching || !keyword.trim()}
            className="search-button"
          >
            {searching ? (
              <>
                <span className="spinner"></span>
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {searchResults && (
        <div className="search-results">
          <div className="results-header">
            <h3>
              Search Results for "{searchResults.keyword}" 
              <span className="results-count">({searchResults.totalResults} found)</span>
            </h3>
          </div>

          {searchResults.totalResults === 0 ? (
            <div className="no-results">
              <p>📭 No files found matching your search.</p>
              <p>Try different keywords or upload more documents.</p>
            </div>
          ) : (
            <div className="results-list">
              {searchResults.results.map((result) => (
                <ResultCard key={result.fileId} result={result} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
