const path = require('path')
const fs = require('fs')
const express = require('express')
const multer = require('multer')
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')
const Document = require('../models/Document')
const AuditLog = require('../models/AuditLog')
const { sha256Buffer } = require('../utils/hash')

const router = express.Router()

const uploadDir = process.env.UPLOAD_DIR || 'uploads/pdfs'
const signedDir = process.env.SIGNED_DIR || 'uploads/signed'

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
if (!fs.existsSync(signedDir)) {
  fs.mkdirSync(signedDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now()
    const ext = path.extname(file.originalname) || '.pdf'
    cb(null, timestamp + '-' + Math.round(Math.random() * 1e9) + ext)
  }
})

const upload = multer({ storage })

router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = req.file.path
    const buffer = fs.readFileSync(filePath)
    const hash = sha256Buffer(buffer)

    const doc = await Document.create({
      originalFilename: req.file.originalname,
      originalPath: filePath,
      originalHash: hash
    })

    await AuditLog.create({
      documentId: doc._id,
      action: 'UPLOAD',
      hashBefore: null,
      hashAfter: hash,
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    })

    res.status(201).json({
      id: doc._id,
      originalHash: doc.originalHash
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/sign-pdf', async (req, res) => {
  try {
    const { documentId, fields } = req.body

    if (!documentId || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: 'Missing documentId or fields array' })
    }

    const doc = await Document.findById(documentId)
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' })
    }

    const originalBuffer = fs.readFileSync(doc.originalPath)
    const hashBefore = sha256Buffer(originalBuffer)

    const pdfDoc = await PDFDocument.load(originalBuffer)
    
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const pages = pdfDoc.getPages()

    for (const field of fields) {
      const { pageIndex, x, y, width, height, value, type } = field

      if (pageIndex < 0 || pageIndex >= pages.length) continue
      const page = pages[pageIndex]

      if (type === 'signature' && value) {
        const dataUrlPrefix = 'base64,'
        let base64Data = value
        const idx = value.indexOf(dataUrlPrefix)
        if (idx !== -1) {
          base64Data = value.slice(idx + dataUrlPrefix.length)
        }

        const signatureBytes = Buffer.from(base64Data, 'base64')
        
        let image
        try {
            if (value.includes('image/jpeg') || value.includes('image/jpg')) {
                image = await pdfDoc.embedJpg(signatureBytes)
            } else {
                image = await pdfDoc.embedPng(signatureBytes)
            }
        } catch (e) {
            console.error("Error embedding image:", e)
            continue
        }

        const intrinsicWidth = image.width
        const intrinsicHeight = image.height
        
        const scaleX = width / intrinsicWidth
        const scaleY = height / intrinsicHeight
        const scale = Math.min(scaleX, scaleY)

        const drawWidth = intrinsicWidth * scale
        const drawHeight = intrinsicHeight * scale

        const drawX = x + (width - drawWidth) / 2
        const drawY = y + (height - drawHeight) / 2

        page.drawImage(image, {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight
        })

      } else if ((type === 'text' || type === 'date') && value) {
        const fontSize = 12
        
        const textY = y + height - fontSize - 4 

        page.drawText(value, {
          x: x + 2, 
          y: textY,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0, 0, 0),
          maxWidth: width
        })
      }
    }

    const signedPdfBytes = await pdfDoc.save()
    const signedFilename = Date.now() + '-signed-' + path.basename(doc.originalPath)
    const signedPath = path.join(signedDir, signedFilename)

    fs.writeFileSync(signedPath, signedPdfBytes)

    const signedBuffer = fs.readFileSync(signedPath)
    const hashAfter = sha256Buffer(signedBuffer)

    doc.signedPath = signedPath
    doc.signedHash = hashAfter
    await doc.save()

    await AuditLog.create({
      documentId: doc._id,
      action: 'SIGN',
      hashBefore,
      hashAfter,
      metadata: {
        fieldsCount: fields.length
      }
    })

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`
    const relativePath = signedPath.split(path.sep).slice(1).join('/') 
  
    const url = `${baseUrl}/files/${path.basename(signedDir)}/${signedFilename}`

    res.json({
      signedPdfUrl: url,
      hashBefore,
      hashAfter
    })
  } catch (err) {
    console.error("Sign PDF Error:", err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
