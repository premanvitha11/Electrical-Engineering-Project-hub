require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'https://electrical-engineering-project-b2peep8ag-premanvithas-projects.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/doubts',   require('./routes/doubts'))
app.use('/api/users',    require('./routes/users'))
app.use('/api/colleges', require('./routes/colleges'))

// Health check - v2
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

// Connect DB and start
const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })
