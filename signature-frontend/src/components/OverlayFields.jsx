import React from 'react'
import { Rnd } from 'react-rnd'

export function OverlayFields({ fields, numPages, containerSize, onFieldUpdate, onFieldDelete, onFieldSelectForSigning }) {
  const pageWidthPx = containerSize.width
  const totalHeightPx = containerSize.height
  const pageHeightPx = numPages > 0 ? totalHeightPx / numPages : 0

  if (!pageWidthPx || !pageHeightPx) return null

  return (
    <div
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'transparent'
      }}
    >
      {fields.map(f => {
        const left = f.nx * pageWidthPx
        const top = f.pageIndex * pageHeightPx + f.ny * pageHeightPx
        const width = f.nWidth * pageWidthPx
        const height = f.nHeight * pageHeightPx

        return (
          <Rnd
            key={f.id}
            className="field-overlay"
            position={{ x: left, y: top }}
            size={{ width, height }}
            onDragStop={(e, d) => {
              const newLeft = d.x
              const newTop = d.y
              const pageIndex = Math.floor(newTop / pageHeightPx)
              const localY = newTop - pageIndex * pageHeightPx

              const nx = newLeft / pageWidthPx
              const ny = localY / pageHeightPx

              onFieldUpdate(f.id, {
                pageIndex: Math.max(0, Math.min(pageIndex, numPages - 1)),
                nx: Math.max(0, Math.min(nx, 1 - f.nWidth)),
                ny: Math.max(0, Math.min(ny, 1 - f.nHeight))
              })
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              const newWidth = parseFloat(ref.style.width)
              const newHeight = parseFloat(ref.style.height)
              const newLeft = position.x
              const newTop = position.y

              const pageIndex = Math.floor(newTop / pageHeightPx)
              const localY = newTop - pageIndex * pageHeightPx

              const nx = newLeft / pageWidthPx
              const ny = localY / pageHeightPx
              const nWidth = newWidth / pageWidthPx
              const nHeight = newHeight / pageHeightPx

              onFieldUpdate(f.id, {
                pageIndex: Math.max(0, Math.min(pageIndex, numPages - 1)),
                nx: Math.max(0, Math.min(nx, 1 - nWidth)),
                ny: Math.max(0, Math.min(ny, 1 - nHeight)),
                nWidth: Math.max(0.05, Math.min(nWidth, 1 - nx)),
                nHeight: Math.max(0.05, Math.min(nHeight, 1 - ny))
              })
            }}
            bounds="parent"
            style={{
              pointerEvents: 'auto',
              border: f.type === 'signature' ? '2px solid #2563eb' : '2px dashed #94a3b8',
              backgroundColor: f.value ? 'transparent' : (f.type === 'signature' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(255, 255, 255, 0.5)'),
              boxSizing: 'border-box',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: f.value ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none'
              }}
            >
              {f.value ? (
                <img
                  src={f.value}
                  alt="Signature"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: f.type === 'signature' ? '#2563eb' : '#64748b'
                  }}>
                    {f.type}
                  </span>
                  
                  {f.type === 'signature' && (
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => {
                        e.stopPropagation()
                        onFieldSelectForSigning(f.id)
                      }}
                      style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      Sign Now
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={e => {
                  e.stopPropagation()
                  onFieldDelete(f.id)
                }}
                onMouseDown={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: -9,
                  right: -9,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: 14,
                  lineHeight: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>
          </Rnd>
        )
      })}
    </div>
  )
}
