import { useState } from 'react'
import Header from './components/Header'
import Upload from './components/Upload'
import Search from './components/Search'
import { type UploadResponse } from './services/api'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload')
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null)

  const handleUploadSuccess = (result: UploadResponse) => {
    setLastUpload(result)
    // Optionally switch to search tab after successful upload
    // setActiveTab('search')
  }

  return (
    <div className="app">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'upload' ? (
          <Upload onUploadSuccess={handleUploadSuccess} />
        ) : (
          <Search />
        )}
      </main>

      {lastUpload && activeTab === 'search' && (
        <div className="recent-upload-hint">
          💡 Recently uploaded: <strong>{lastUpload.fileName}</strong>
        </div>
      )}
    </div>
  )
}

export default App
