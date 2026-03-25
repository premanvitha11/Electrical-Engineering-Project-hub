require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

const app = express()

// Middleware
app.use(cors({ origin: [process.env.CLIENT_URL, 'https://electrical-engineering-project-b2peep8ag-premanvithas-projects.vercel.app'], credentials: true }))
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

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

// Connect DB and start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(process.env.PORT, () => console.log(`🚀 Server running on http://localhost:${process.env.PORT}`))
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })
