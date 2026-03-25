const router = require('express').Router()
const College = require('../models/College')
const Project = require('../models/Project')
const { protect } = require('../middleware/auth')

// GET /api/colleges — list all colleges with real project counts
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 })

    const result = await Promise.all(colleges.map(async (c) => {
      const count = await Project.countDocuments({ college: c.name, status: 'approved' })
      const years = await Project.distinct('year', { college: c.name, status: 'approved' })
      return {
        _id:      c._id,
        name:     c.name,
        dept:     c.dept,
        isPublic: c.isPublic,
        count,
        years: years.filter(Boolean).sort((a, b) => b - a),
      }
    }))

    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/colleges/:name/projects?year=2024
router.get('/:name/projects', async (req, res) => {
  try {
    const { year } = req.query
    const filter = { college: req.params.name, status: 'approved' }
    if (year) filter.year = Number(year)

    const projects = await Project.find(filter)
      .populate('author', 'name role')
      .sort({ createdAt: -1 })
    res.json(projects)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/colleges/register — register a new college
router.post('/register', protect, async (req, res) => {
  try {
    const { name, dept, isPublic, adminEmail } = req.body
    if (!name || !dept) return res.status(400).json({ message: 'name and dept are required' })
    const exists = await College.findOne({ name })
    if (exists) return res.status(409).json({ message: 'College already registered' })
    const college = await College.create({ name, dept, isPublic, adminEmail })
    res.status(201).json(college)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
