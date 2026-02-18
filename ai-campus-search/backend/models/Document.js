const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  embedding: [{ type: Number }]
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  department: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chunks: [chunkSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);