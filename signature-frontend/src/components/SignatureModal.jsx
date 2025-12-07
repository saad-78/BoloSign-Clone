import React, { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'

function trimCanvas(c) {
  const ctx = c.getContext('2d')
  const copy = document.createElement('canvas').getContext('2d')
  const pixels = ctx.getImageData(0, 0, c.width, c.height)
  let l = c.width
  let t = c.height
  let r = 0
  let b = 0
  let x, y, i

  for (i = 0; i < pixels.data.length; i += 4) {
    if (pixels.data[i + 3] !== 0) { 
      x = (i / 4) % c.width
      y = ~~((i / 4) / c.width)

      if (x < l) l = x
      if (y < t) t = y
      if (x > r) r = x
      if (y > b) b = y
    }
  }

  if (l > r) return c

  const w = r - l + 1
  const h = b - t + 1

  copy.canvas.width = w
  copy.canvas.height = h
  copy.putImageData(ctx.getImageData(l, t, w, h), 0, 0)

  return copy.canvas
}

export function SignatureModal({ isOpen, onClose, onSave }) {
  const sigCanvas = useRef({})

  if (!isOpen) return null

  const clear = () => sigCanvas.current.clear()

  const save = () => {
    if (sigCanvas.current.isEmpty()) return
    
    const rawCanvas = sigCanvas.current.getCanvas()
    
    const trimmedCanvas = trimCanvas(rawCanvas)
    
    const dataURL = trimmedCanvas.toDataURL('image/png')
    
    onSave(dataURL)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: 24,
          borderRadius: 12,
          width: 700, 
          maxWidth: '95%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, color: '#111', fontWeight: 600 }}>
          Draw your signature
        </h3>
        
        <div style={{ border: '2px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' }}>
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            minWidth={2.5} 
            maxWidth={5.0} 
            velocityFilterWeight={0.7}
            canvasProps={{
              width: 652, 
              height: 300, 
              className: 'sigCanvas',
              style: { display: 'block' }
            }}
          />
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button 
            onClick={clear}
            style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                backgroundColor: '#fff',
                fontSize: 14,
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer'
            }}
          >
            Clear
          </button>
          <button 
            onClick={onClose}
            style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                backgroundColor: '#fff',
                fontSize: 14,
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            style={{ 
                backgroundColor: '#0e8ce0ff',
                color: '#fff', 
                border: 'none', 
                padding: '10px 24px', 
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
            }}
          >
            Save Signature
          </button>
        </div>
      </div>
    </div>
  )
}
