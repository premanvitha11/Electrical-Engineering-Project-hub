const mongoose = require('mongoose')

const collegeSchema = new mongoose.Schema({
  name:       { type: String, required: true, unique: true, trim: true },
  dept:       { type: String, required: true },
  isPublic:   { type: Boolean, default: true },
  adminEmail: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('College', collegeSchema)
