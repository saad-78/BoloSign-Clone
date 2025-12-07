import { useState } from 'react'
import axios from 'axios'
import '@react-pdf-viewer/core/lib/styles/index.css'
import { PDFViewer } from './components/PDFViewer'
import { SignatureModal } from './components/SignatureModal'

const BACKEND_URL = 'https://bolosign-clone.onrender.com'

function App() {
  const [fileUrl, setFileUrl] = useState(null)
  const [documentId, setDocumentId] = useState(null)
  const [pagesMeta, setPagesMeta] = useState([])
  const [fields, setFields] = useState([])
  const [activeType, setActiveType] = useState('signature')
  const [numPages, setNumPages] = useState(0)
  

  const [isSigModalOpen, setIsSigModalOpen] = useState(false)
  const [activeFieldId, setActiveFieldId] = useState(null) 
  const [selectedFieldId, setSelectedFieldId] = useState(null) 
  const [isDragging, setIsDragging] = useState(false) 


  const processFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(`${BACKEND_URL}/api/upload-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const id = res.data.id
      setDocumentId(id)

      const metaRes = await axios.get(`${BACKEND_URL}/api/pdf-meta/${id}`)
      setPagesMeta(metaRes.data.pages)
      setNumPages(metaRes.data.pages.length)

      const blobUrl = URL.createObjectURL(file)
      setFileUrl(blobUrl)
      setFields([])
      setSelectedFieldId(null)
    } catch (error) {
      console.error(error)
      alert("Error uploading file.")
    }
  }

  const handleUpload = async e => {
    const file = e.target.files?.[0]
    if (file) await processFile(file)
  }


  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await processFile(file)
  }


  const handleFieldAdd = (fieldData) => {
    const newId = String(Date.now())
    const field = {
      id: newId,
      ...fieldData
    }
    setFields(prev => [...prev, field])
    setSelectedFieldId(newId) 
  }

  const handleFieldUpdate = (fieldId, updates) => {
    setFields(prev =>
      prev.map(f => (f.id === fieldId ? { ...f, ...updates } : f))
    )
  }

  const handleFieldDelete = fieldId => {
    setFields(prev => prev.filter(f => f.id !== fieldId))
    setSelectedFieldId(null)
  }

  const handleFieldSelectForSigning = (fieldId) => {
    setActiveFieldId(fieldId)
    setIsSigModalOpen(true)
  }

  const handleSignatureSave = (base64Signature) => {
    if (!activeFieldId) return
    handleFieldUpdate(activeFieldId, { value: base64Signature })
    setSelectedFieldId(null) 
  }

  const handleSign = async () => {
    if (!documentId || !pagesMeta.length || !fields.length) return

    const fieldsToBurn = fields.map(field => {
      const pageMeta = pagesMeta[field.pageIndex]
      const { widthPt, heightPt } = pageMeta

      return {
        ...field,
        x: field.nx * widthPt,
        y: (1 - field.ny - field.nHeight) * heightPt, 
        width: field.nWidth * widthPt,
        height: field.nHeight * heightPt
      }
    })

    const hasValue = fieldsToBurn.some(f => f.value)
    if (!hasValue) {
      alert('Please fill at least one field (signature, text, or date) before saving.')
      return
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/api/sign-pdf`, {
        documentId,
        fields: fieldsToBurn 
      })

      const url = res.data.signedPdfUrl
      window.open(url, '_blank')
      
    } catch (error) {
      console.error("Error signing pdf:", error)
      alert("Error generating PDF. Check console for details.")
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        backgroundColor: '#f8fafc',
        color: '#334155'
      }}
      onClick={() => setSelectedFieldId(null)}
    >

      <div
        style={{
          width: 280,
          padding: '24px',
          borderRight: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em' }}>
            BoloSign Clone
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Simple PDF Signing Tool
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Step 1: Upload
          </label>
          
        
          <div 
            style={{ 
              position: 'relative',
              border: isDragging ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
              backgroundColor: isDragging ? '#eff6ff' : '#f8fafc',
              borderRadius: 8,
              padding: '20px',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('pdf-upload').click()}
          >
            <input 
              id="pdf-upload"
              type="file" 
              accept="application/pdf" 
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
            <div style={{ pointerEvents: 'none' }}>
                <span style={{ display: 'block', fontSize: 24, marginBottom: 8 }}>📄</span>
                <span style={{ fontSize: 13, color: isDragging ? '#2563eb' : '#64748b', fontWeight: 500 }}>
                    {isDragging ? 'Drop PDF here' : 'Click or Drag PDF'}
                </span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Step 2: Field Type
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={activeType}
              onChange={e => setActiveType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                color: '#334155',
                appearance: 'none',
                backgroundColor: '#fff',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px'
              }}
            >
              <option value="signature">Signature Field</option>
              <option value="text">Text Field</option>
              <option value="date">Date Field</option>
            </select>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ 
            backgroundColor: '#f1f5f9', 
            borderRadius: 8, 
            padding: 16, 
            fontSize: 13, 
            lineHeight: 1.5,
            color: '#475569' 
          }}>
            <strong>Instructions:</strong>
            <ul style={{ paddingLeft: 16, margin: '8px 0 0' }}>
              <li style={{ marginBottom: 4 }}>Click anywhere on the document to add a field.</li>
              <li style={{ marginBottom: 4 }}>Drag to move, resize from corners.</li>
              <li>Click <strong>Sign</strong> to draw your signature.</li>
            </ul>
          </div>
        </div>

        <button
          style={{
            marginTop: 24,
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: !documentId ? '#94a3b8' : '#2563eb',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: !documentId ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            boxShadow: !documentId ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
          }}
          onClick={handleSign}
          disabled={!documentId || !fields.length}
        >
          Download Signed PDF
        </button>
      </div>

      {/* Main Content */}
      <div 
        style={{ flex: 1, overflow: 'hidden', position: 'relative', backgroundColor: '#f8fafc' }}
        // Optional: Allow dropping on the main area too
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div style={{ 
          height: '100%', 
          overflow: 'auto', 
          padding: '40px', 
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center',
          // Show visual cue if dragging over main area
          border: isDragging ? '4px dashed #2563eb' : 'none',
          backgroundColor: isDragging ? 'rgba(37,99,235,0.05)' : '#f8fafc'
        }}>
          {fileUrl ? (
            <>
              <PDFViewer
                fileUrl={fileUrl}
                numPages={numPages}
                fields={fields}
                activeType={activeType}
                selectedFieldId={selectedFieldId}
                onSelectField={setSelectedFieldId}
                onFieldAdd={handleFieldAdd}
                onFieldUpdate={handleFieldUpdate}
                onFieldDelete={handleFieldDelete}
                onFieldSelectForSigning={handleFieldSelectForSigning}
              />
              <SignatureModal 
                isOpen={isSigModalOpen}
                onClose={() => setIsSigModalOpen(false)}
                onSave={handleSignatureSave}
              />
            </>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDragging ? '#2563eb' : '#94a3b8',
                gap: 16,
                pointerEvents: 'none' // Let drops pass through to container
              }}
            >
              <div style={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                backgroundColor: isDragging ? '#bfdbfe' : '#e2e8f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p style={{ fontSize: 16, fontWeight: 500 }}>
                {isDragging ? 'Drop to Upload' : 'Upload a PDF to get started'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
