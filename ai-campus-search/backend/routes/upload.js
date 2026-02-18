const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/Document');
const { generateEmbeddings } = require('../utils/embedding');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|gif|png|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Files of this type are not allowed'));
    }
  }
});

// Extract text from different file types
async function extractText(filePath, file) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf8');
  } else {
    throw new Error('Unsupported file type');
  }
}

// Chunk text into 500-word segments
function chunkText(text) {
  const words = text.split(/\s+/);
  const chunks = [];
  const chunkSize = 500;

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
  }

  return chunks;
}

// POST /api/upload
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { department } = req.body;
    const filePath = req.file.path;
    
    // Extract text from file
    let text = await extractText(filePath, req.file);
    
    // Chunk text
    const textChunks = chunkText(text);
    
    // Generate embeddings for each chunk
    const chunksWithEmbeddings = [];
    for (const chunk of textChunks) {
      const embedding = await generateEmbeddings(chunk);
      chunksWithEmbeddings.push({
        text: chunk,
        embedding: embedding.data[0].embedding
      });
    }

    // Create document record
    const document = new Document({
      title: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      department,
      uploadedBy: req.user._id,
      chunks: chunksWithEmbeddings
    });

    await document.save();

    res.json({ message: 'File uploaded successfully', documentId: document._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

module.exports = router;