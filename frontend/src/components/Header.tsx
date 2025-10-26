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
          🎓 Smart Study Material Organizer
        </h1>
        <p className="app-subtitle">
          Upload PDFs, extract keywords automatically, and search your study materials
        </p>
        
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => onTabChange('upload')}
          >
            📤 Upload
          </button>
          <button
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => onTabChange('search')}
          >
            🔍 Search
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
