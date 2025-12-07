const crypto = require('crypto')

function sha256Buffer(buffer) {
  const hash = crypto.createHash('sha256')
  hash.update(buffer)
  return hash.digest('hex')
}

module.exports = { sha256Buffer }
