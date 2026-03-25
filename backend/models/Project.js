const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  subject:    { type: String, required: true, enum: ['Power', 'Machines', 'Control', 'Electronics'] },
  abstract:   { type: String, required: true },
  objectives: [String],
  tools:      [String],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Advanced'], required: true },
  semester:   { type: Number },
  college:    { type: String },
  year:       { type: Number },
  author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rating:     { type: Number, default: 0 },
  ratingCount:{ type: Number, default: 0 },
  files: {
    report:     { name: String, path: String },
    images:     [{ name: String, path: String }],
    simulation: { name: String, path: String },
    model3d:    { name: String, path: String },
  },
}, { timestamps: true })

module.exports = mongoose.model('Project', projectSchema)
