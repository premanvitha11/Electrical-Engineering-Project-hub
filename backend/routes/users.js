const router = require('express').Router()
const User = require('../models/User')
const Project = require('../models/Project')
const { protect } = require('../middleware/auth')

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('savedProjects', 'title subject difficulty rating')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/users/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, college, semester, phone } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { name, college, semester, phone }, { new: true }).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/users/save/:projectId  — toggle save
router.post('/save/:projectId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const pid = req.params.projectId
    const idx = user.savedProjects.indexOf(pid)
    if (idx === -1) user.savedProjects.push(pid)
    else user.savedProjects.splice(idx, 1)
    await user.save()
    res.json({ saved: idx === -1, savedProjects: user.savedProjects })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/users/experts  — list professors and seniors
router.get('/experts', async (req, res) => {
  try {
    const experts = await User.find({ role: { $in: ['Professor', 'Senior'] } }).select('-password')
    res.json(experts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
