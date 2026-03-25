const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, college, semester } = req.body
    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ message: 'Name, password, and email or phone are required' })
    }
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, phone, password, role, college, semester })
    res.status(201).json({ token: signToken(user._id), user: { id: user._id, name: user.name, role: user.role, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    res.json({ token: signToken(user._id), user: { id: user._id, name: user.name, role: user.role, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, (req, res) => {
  res.json(req.user)
})

module.exports = router
