const mongoose = require('mongoose')

function connectDB() {
  return mongoose.connect(process.env.MONGO_URI, {
    autoIndex: true
  })
}

module.exports = connectDB
