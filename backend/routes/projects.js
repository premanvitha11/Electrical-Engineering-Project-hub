const router = require('express').Router()
const Project = require('../models/Project')
const { protect, requireRole } = require('../middleware/auth')
const { projectUpload } = require('../middleware/upload')

// helper: map multer files to schema shape
function mapFiles(files = {}) {
  return {
    report:     files.report?.[0]     ? { name: files.report[0].originalname,     path: `/uploads/projects/${files.report[0].filename}` }     : undefined,
    images:     (files.images || []).map(f => ({ name: f.originalname, path: `/uploads/projects/${f.filename}` })),
    simulation: files.simulation?.[0] ? { name: files.simulation[0].originalname, path: `/uploads/projects/${files.simulation[0].filename}` } : undefined,
    model3d:    files.model3d?.[0]    ? { name: files.model3d[0].originalname,    path: `/uploads/projects/${files.model3d[0].filename}` }    : undefined,
  }
}

// POST /api/projects  — upload a new project
router.post('/', protect, (req, res) => {
  projectUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message })
    try {
      const { title, subject, abstract, objectives, tools, difficulty, semester, college, year, reportLink, simulationLink, model3dLink, imageLinks } = req.body
      if (!title || !subject || !abstract || !difficulty) {
        return res.status(400).json({ message: 'title, subject, abstract and difficulty are required' })
      }
      const project = await Project.create({
        title, subject, abstract, difficulty, semester, college,
        year: year ? Number(year) : new Date().getFullYear(),
        objectives: objectives ? JSON.parse(objectives) : [],
        tools:      tools      ? JSON.parse(tools)      : [],
        author: req.user._id,
        files: mapFiles(req.files),
        links: { report: reportLink, images: imageLinks, simulation: simulationLink, model3d: model3dLink },
        status: 'approved',
      })
      res.status(201).json(project)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
})

// GET /api/projects/popular
router.get('/popular', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'approved' })
      .populate('author', 'name role college')
      .sort({ views: -1 })
      .limit(4)
    res.json(projects)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/projects/recent
router.get('/recent', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'approved' })
      .populate('author', 'name role college')
      .sort({ createdAt: -1 })
      .limit(4)
    res.json(projects)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/projects  — list approved projects with filters
router.get('/', async (req, res) => {
  try {
    const { subject, difficulty, semester, search } = req.query
    const filter = { status: 'approved' }
    if (subject)    filter.subject    = subject
    if (difficulty) filter.difficulty = difficulty
    if (semester)   filter.semester   = Number(semester)
    if (search)     filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { abstract: { $regex: search, $options: 'i' } },
    ]
    const projects = await Project.find(filter)
      .populate('author', 'name role college')
      .sort({ createdAt: -1 })
    res.json(projects)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/projects/my  — logged-in user's own projects
router.get('/my', protect, async (req, res) => {
  try {
    const projects = await Project.find({ author: req.user._id }).sort({ createdAt: -1 })
    res.json(projects)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name role college')
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/projects/:id — only the author can delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    if (project.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' })
    }
    await project.deleteOne()
    res.json({ message: 'Project deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/projects/:id/approve  — Professor/admin only
router.patch('/:id/approve', protect, requireRole('Professor'), async (req, res) => {
  try {
    const { status } = req.body  // 'approved' or 'rejected'
    const project = await Project.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/projects/:id/rate
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { rating } = req.body
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' })
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    const newCount = project.ratingCount + 1
    const newRating = ((project.rating * project.ratingCount) + rating) / newCount
    project.rating = Math.round(newRating * 10) / 10
    project.ratingCount = newCount
    await project.save()
    res.json({ rating: project.rating, ratingCount: project.ratingCount })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
