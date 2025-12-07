const fs = require('fs')
const path = require('path')
const express = require('express')
const { PDFDocument } = require('pdf-lib')
const Document = require('../models/Document')

const router = express.Router()

router.get('/pdf-meta/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' })
    }

    const buffer = fs.readFileSync(doc.originalPath)
    const pdfDoc = await PDFDocument.load(buffer)
    const pages = pdfDoc.getPages()

    const pagesMeta = pages.map(page => {
      const { width, height } = page.getSize()
      return { widthPt: width, heightPt: height }
    })

    res.json({
      id: doc._id,
      pages: pagesMeta
    })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
