const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:     { type: String, required: true },
  verified: { type: Boolean, default: false },
  image:    { name: String, path: String },
}, { timestamps: true })

const doubtSchema = new mongoose.Schema({
  subject:  { type: String, required: true },
  question: { type: String, required: true },
  image:    { name: String, path: String },
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers:  [answerSchema],
}, { timestamps: true })

module.exports = mongoose.model('Doubt', doubtSchema)
