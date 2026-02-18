const express = require('express');
const User = require('../models/User');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/users
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/documents
router.get('/documents', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const documents = await Document.find({})
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/stats
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalUsers = await User.countDocuments({});
    const totalDocuments = await Document.countDocuments({});
    
    // Calculate total searches by counting all searchHistory entries
    const users = await User.find({});
    let totalSearches = 0;
    for (const user of users) {
      totalSearches += user.searchHistory.length;
    }

    res.json({
      totalUsers,
      totalDocuments,
      totalSearches
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/document/:id
router.delete('/document/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;