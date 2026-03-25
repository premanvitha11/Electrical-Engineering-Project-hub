const multer = require('multer')
const path = require('path')
const fs = require('fs')

const ALLOWED = {
  report:     ['.pdf'],
  images:     ['.jpg', '.jpeg', '.png', '.webp'],
  simulation: ['.slx', '.mdl', '.m', '.zip'],
  model3d:    ['.glb', '.obj', '.zip'],
  doubt:      ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
}

function makeStorage(folder) {
  const dir = path.join(__dirname, '..', 'uploads', folder)
  fs.mkdirSync(dir, { recursive: true })
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e6)
      cb(null, unique + path.extname(file.originalname).toLowerCase())
    },
  })
}

function fileFilter(allowedExts) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedExts.includes(ext)) return cb(null, true)
    cb(new Error(`Invalid file type. Allowed: ${allowedExts.join(', ')}`))
  }
}

// Project upload: report(1) + images(5) + simulation(1) + model3d(1)
const projectUpload = multer({
  storage: makeStorage('projects'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
  fileFilter: (req, file, cb) => {
    const allAllowed = [...new Set(Object.values(ALLOWED).flat())]
    const ext = path.extname(file.originalname).toLowerCase()
    if (allAllowed.includes(ext)) return cb(null, true)
    cb(new Error(`File type ${ext} not allowed`))
  },
}).fields([
  { name: 'report',     maxCount: 1 },
  { name: 'images',     maxCount: 5 },
  { name: 'simulation', maxCount: 1 },
  { name: 'model3d',    maxCount: 1 },
])

// Doubt image upload
const doubtUpload = multer({
  storage: makeStorage('doubts'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter(ALLOWED.doubt),
}).single('image')

module.exports = { projectUpload, doubtUpload }
