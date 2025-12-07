const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    action: { type: String, required: true },
    hashBefore: { type: String },
    hashAfter: { type: String },
    metadata: { type: Object }
  },
  { timestamps: true }
)

module.exports = mongoose.model('AuditLog', auditLogSchema)
