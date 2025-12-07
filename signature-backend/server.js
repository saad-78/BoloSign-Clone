const path = require('path')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const pdfRoutes = require('./routes/pdfRoutes')
const metaRoutes = require('./routes/metaRoutes')
dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const uploadsRoot = path.join(__dirname, 'uploads')
app.use('/files', express.static(uploadsRoot))
app.use('/api', metaRoutes)


app.use('/api', pdfRoutes)

const port = process.env.PORT || 4000

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log('Server running on port ' + port)
    })
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  })
