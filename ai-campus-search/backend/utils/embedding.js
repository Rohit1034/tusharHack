const axios = require('axios');

async function generateEmbeddings(text) {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/embeddings",
      {
        model: "openai/text-embedding-3-small",
        input: text,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

module.exports = { generateEmbeddings };