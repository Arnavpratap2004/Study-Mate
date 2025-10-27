import React from 'react';

interface HeaderProps {
  activeTab: 'upload' | 'search';
  onTabChange: (tab: 'upload' | 'search') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">
          📚 Study Mate
        </h1>
        <p className="app-subtitle">
          Your intelligent study companion. Upload PDFs, extract insights automatically, 
          and find your materials instantly with AI-powered search.
        </p>
        
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => onTabChange('upload')}
            aria-label="Upload documents"
          >
            <span className="tab-icon">📤</span>
            <span>Upload</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => onTabChange('search')}
            aria-label="Search documents"
          >
            <span className="tab-icon">🔍</span>
            <span>Search</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
