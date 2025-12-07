import React from 'react'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import { Rnd } from 'react-rnd'

export function PDFViewer({
  fileUrl,
  fields,
  activeType,
  selectedFieldId,
  onSelectField,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  onFieldSelectForSigning
}) {
  
  const renderPage = (props) => {
    const pageWidth = props.width
    const pageHeight = props.height
    
    return (
      <>
        {props.canvasLayer.children}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            cursor: 'crosshair'
          }}
          onMouseDown={e => {
             if (e.target === e.currentTarget) {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top
                
                const boxWidth = pageWidth * 0.2
                const boxHeight = pageHeight * 0.05
                
                const nx = x / pageWidth
                const ny = y / pageHeight
                const nWidth = boxWidth / pageWidth
                const nHeight = boxHeight / pageHeight

                onFieldAdd({
                  pageIndex: props.pageIndex,
                  nx: Math.min(Math.max(nx, 0), 1 - nWidth),
                  ny: Math.min(Math.max(ny, 0), 1 - nHeight),
                  nWidth,
                  nHeight,
                  type: activeType,
                  value: ''
                })
             }
          }}
        >
          {fields
            .filter(f => f.pageIndex === props.pageIndex)
            .map(f => {
              const isSelected = f.id === selectedFieldId
              
              return (
                <Rnd
                  key={f.id}
                  position={{
                    x: f.nx * pageWidth,
                    y: f.ny * pageHeight
                  }}
                  size={{
                    width: f.nWidth * pageWidth,
                    height: f.nHeight * pageHeight
                  }}
                  cancel=".no-drag"
                  onDragStop={(e, d) => {
                    onFieldUpdate(f.id, {
                       nx: d.x / pageWidth,
                       ny: d.y / pageHeight
                    })
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    const newWidth = parseFloat(ref.style.width)
                    const newHeight = parseFloat(ref.style.height)

                    onFieldUpdate(f.id, {
                      nx: position.x / pageWidth,
                      ny: position.y / pageHeight,
                      nWidth: newWidth / pageWidth,
                      nHeight: newHeight / pageHeight
                    })
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectField(f.id)
                  }}
                  bounds="parent"
                  style={{
                    position: 'absolute',
                    border: isSelected 
                        ? '2px solid #2563eb' 
                        : (f.value ? '1px solid transparent' : '2px dashed #94a3b8'),
                    backgroundColor: f.value 
                        ? 'transparent' 
                        : (isSelected ? 'rgba(37, 99, 235, 0.05)' : 'rgba(255, 255, 255, 0.6)'),
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none',
                    zIndex: isSelected ? 30 : 20
                  }}
                >
                    {isSelected && (
                        <div
                            style={{
                                position: 'absolute',
                                top: -20,
                                left: -2,
                                height: 20,
                                padding: '0 8px',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                fontSize: 10,
                                fontWeight: 'bold',
                                borderTopLeftRadius: 4,
                                borderTopRightRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'move',
                                zIndex: 50,
                                pointerEvents: 'auto' 
                            }}
                        >
                            {f.type} (Drag)
                        </div>
                    )}

                    {f.type === 'text' && (
                        <textarea
                            className="no-drag" 
                            value={f.value || ''}
                            placeholder={isSelected ? "Type here..." : ""}
                            onChange={(e) => onFieldUpdate(f.id, { value: e.target.value })}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                background: 'transparent',
                                resize: 'none',
                                fontFamily: 'Helvetica, sans-serif',
                                fontSize: '14px',
                                padding: '4px',
                                outline: 'none',
                                color: '#000',
                                cursor: 'text'
                            }}
                        />
                    )}

                    {f.type === 'date' && (
                        <input
                            type="date"
                            className="no-drag" 
                            value={f.value || ''}
                            onChange={(e) => onFieldUpdate(f.id, { value: e.target.value })}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                background: 'transparent',
                                fontFamily: 'Helvetica, sans-serif',
                                fontSize: '12px',
                                outline: 'none',
                                color: '#000',
                                padding: '4px',
                                cursor: 'pointer'
                            }}
                        />
                    )}

                    {f.type === 'signature' && (
                        f.value ? (
                            <img 
                                src={f.value} 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'contain', 
                                    pointerEvents: 'none'
                                }} 
                            />
                        ) : (
                            <span style={{ 
                                fontSize: 11, 
                                fontWeight: 700, 
                                textTransform: 'uppercase',
                                color: '#2563eb',
                                userSelect: 'none',
                                opacity: 0.8
                            }}>
                                Signature
                            </span>
                        )
                    )}

                    {isSelected && (
                        <button
                            className="no-drag"
                            onClick={(e) => {
                                e.stopPropagation()
                                onFieldDelete(f.id)
                            }}
                            onMouseDown={e => e.stopPropagation()}
                            style={{
                                position: 'absolute',
                                top: -12,
                                right: -12,
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                border: '2px solid #fff',
                                fontSize: 16,
                                lineHeight: 1,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 60,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                padding: 0
                            }}
                        >
                            ×
                        </button>
                    )}

                    {f.type === 'signature' && !f.value && isSelected && (
                         <button
                            className="no-drag"
                            onClick={(e) => {
                                e.stopPropagation()
                                onFieldSelectForSigning(f.id)
                            }}
                            onMouseDown={e => e.stopPropagation()}
                            style={{
                                position: 'absolute',
                                bottom: -34,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: '#2563eb',
                                color: '#fff',
                                border: 'none',
                                fontSize: 12,
                                fontWeight: 600,
                                padding: '6px 16px',
                                borderRadius: 20,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                zIndex: 60,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                         >
                            Sign Here
                         </button>
                    )}
                </Rnd>
              )
            })}
        </div>
        {props.textLayer.children}
        {props.annotationLayer.children}
      </>
    )
  }

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelectField(null)
      }}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={fileUrl}
          renderPage={renderPage}
          defaultScale={1.0}
        />
      </Worker>
    </div>
  )
}
