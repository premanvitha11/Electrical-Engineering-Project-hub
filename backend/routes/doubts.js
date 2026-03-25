const router = require('express').Router()
const Doubt = require('../models/Doubt')
const { protect, requireRole } = require('../middleware/auth')
const { doubtUpload } = require('../middleware/upload')

// POST /api/doubts  — post a doubt with optional image
router.post('/', protect, (req, res) => {
  doubtUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message })
    try {
      const { subject, question } = req.body
      if (!subject || !question) return res.status(400).json({ message: 'subject and question are required' })
      const image = req.file ? { name: req.file.originalname, path: `/uploads/doubts/${req.file.filename}` } : undefined
      const doubt = await Doubt.create({ subject, question, image, author: req.user._id })
      await doubt.populate('author', 'name role')
      res.status(201).json(doubt)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
})

// GET /api/doubts  — list all doubts
router.get('/', async (req, res) => {
  try {
    const { subject } = req.query
    const filter = subject ? { subject } : {}
    const doubts = await Doubt.find(filter)
      .populate('author', 'name role')
      .populate('answers.author', 'name role')
      .sort({ createdAt: -1 })
    res.json(doubts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/doubts/:id/answer  — post an answer
router.post('/:id/answer', protect, (req, res) => {
  doubtUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message })
    try {
      const { text } = req.body
      if (!text) return res.status(400).json({ message: 'Answer text is required' })
      const image = req.file ? { name: req.file.originalname, path: `/uploads/doubts/${req.file.filename}` } : undefined
      const doubt = await Doubt.findById(req.params.id)
      if (!doubt) return res.status(404).json({ message: 'Doubt not found' })
      doubt.answers.push({ author: req.user._id, text, image })
      await doubt.save()
      await doubt.populate('answers.author', 'name role')
      res.json(doubt)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
})

// PATCH /api/doubts/:id/answers/:answerId/verify  — Professor only
router.patch('/:id/answers/:answerId/verify', protect, requireRole('Professor'), async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' })
    const answer = doubt.answers.id(req.params.answerId)
    if (!answer) return res.status(404).json({ message: 'Answer not found' })
    answer.verified = true
    await doubt.save()
    res.json({ message: 'Answer verified' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
