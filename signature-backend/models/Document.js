const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema(
  {
    originalFilename: { type: String, required: true },
    originalPath: { type: String, required: true },
    originalHash: { type: String, required: true },
    signedPath: { type: String },
    signedHash: { type: String }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Document', documentSchema)
