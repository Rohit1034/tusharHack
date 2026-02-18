const express = require('express');
const axios = require('axios');
const Document = require('../models/Document');
const { calculateCosineSimilarity } = require('../utils/similarity');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/search
router.post('/', auth, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Generate embedding for the query
    const queryResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    
    const queryEmbedding = queryResponse.data[0].embedding;

    // Find all documents
    const documents = await Document.find({ department: req.user.department });

    // Calculate similarities
    let allChunks = [];
    for (const doc of documents) {
      for (const chunk of doc.chunks) {
        const similarity = calculateCosineSimilarity(queryEmbedding, chunk.embedding);
        allChunks.push({
          text: chunk.text,
          similarity,
          documentId: doc._id,
          title: doc.title
        });
      }
    }

    // Sort by similarity (descending)
    allChunks.sort((a, b) => b.similarity - a.similarity);

    // Get top 5 chunks
    const topResults = allChunks.slice(0, 5);

    // Prepare content for GPT summary
    const top3Content = topResults.slice(0, 3).map(result => result.text).join('\n\n');

    // Generate AI summary
    let aiSummary = '';
    if (top3Content.trim()) {
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openai/gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: `Summarize the following academic content and highlight key insights:\n\n${top3Content}`
              }
            ],
            max_tokens: 300
          },
          {
            headers: {
              "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        aiSummary = response.data.choices[0].message.content;
      } catch (summaryErr) {
        console.error('Error generating summary:', summaryErr);
      }
    }

    // Get related documents
    const relatedDocIds = [...new Set(topResults.map(r => r.documentId))];
    const relatedDocs = await Document.find({ _id: { $in: relatedDocIds } }).limit(5);

    // Update user's search history
    await req.user.updateOne({
      $push: {
        searchHistory: {
          query: query,
          timestamp: new Date()
        }
      }
    });

    res.json({
      results: topResults,
      summary: aiSummary,
      relatedDocs: relatedDocs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error during search' });
  }
});

// GET /api/recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Find documents matching user's department and interests
    const userInterests = req.user.interests || [];
    
    // Find documents in user's department
    const documents = await Document.find({ 
      department: req.user.department 
    }).limit(5);
    
    // If user has interests, try to match documents that might be related
    let recommendedDocs = documents;
    
    // In a real implementation, you'd have more sophisticated recommendation logic
    // For now, just return documents from the user's department
    
    res.json(recommendedDocs);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error during recommendations' });
  }
});

module.exports = router;