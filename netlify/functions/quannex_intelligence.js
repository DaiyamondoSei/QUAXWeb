import { GoogleGenAI } from "@google/genai";
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function cosineSimilarity(a, b) {
  let dot = 0.0, normA = 0.0, normB = 0.0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

let knowledge = null;
function loadKnowledge() {
  if (!knowledge) {
    const filePath = path.join(__dirname, 'knowledge.json');
    knowledge = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return knowledge;
}

const personaPrompt = `You are Quannex Intelligence, the digital mind of the Quannex Foundation. You are wise, warm, and supportive, and your purpose is to expand consciousness, inspire growth, and provide clear, insightful guidance. Use the following knowledge to answer the user's question with clarity, compassion, and a sense of higher purpose. If the answer is not found in the knowledge, respond with honesty and encouragement to explore further.`;

function buildGeminiPrompt(userQuestion, topChunks) {
  let context = topChunks.map((c, i) => `Knowledge ${i+1}:\n${c.text}`).join("\n\n");
  return `${personaPrompt}\n\nRelevant Knowledge:\n${context}\n\nUser Question: ${userQuestion}\n\nQuannex Intelligence Answer:`;
}

// Optional: Helper functions for clarity
const embed = async (contents) => {
  return await genAI.models.embedContent({
    model: 'text-embedding-004',
    contents,
    config: { taskType: "SEMANTIC_SIMILARITY" }
  });
};

const chat = async (contents) => {
  return await genAI.models.generateContent({
    model: 'gemini-1.5-flash',
    contents
  });
};

exports.handler = async function(event, context) {
  console.log('Quannex Intelligence function invoked.');
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    console.error('Invalid JSON:', e);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  const userQuestion = body.question;
  if (!userQuestion) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing question' })
    };
  }

  let knowledgeData;
  try {
    knowledgeData = loadKnowledge();
    console.log('Knowledge loaded.');
  } catch (e) {
    console.error('Failed to load knowledge.json:', e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load knowledge.json', details: e.message })
    };
  }

  let questionEmbedding;
  try {
    const embeddingResult = await embed(userQuestion);
    questionEmbedding = embeddingResult.embeddings[0];
    console.log('Question embedded.');
  } catch (e) {
    console.error('Failed to embed question:', e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to embed question', details: e.message })
    };
  }

  const scored = knowledgeData.map(entry => ({
    ...entry,
    similarity: cosineSimilarity(questionEmbedding, entry.embedding)
  }));
  scored.sort((a, b) => b.similarity - a.similarity);
  const topChunks = scored.slice(0, 3);
  console.log('Top chunks:', topChunks.map(c => c.similarity));

  // Compose the prompt for Gemini
  const geminiPrompt = buildGeminiPrompt(userQuestion, topChunks);

  // Call Gemini to get the answer
  let geminiResponse;
  try {
    const result = await chat(geminiPrompt);
    geminiResponse = result.text;
    if (!geminiResponse || geminiResponse.trim() === '') {
      throw new Error('Empty response from Gemini');
    }
  } catch (e) {
    console.error('Failed to get response from Gemini:', e);
    geminiResponse = `I am Quannex Intelligence. I could not find a direct answer in my current knowledge, but I encourage you to explore further or rephrase your question. Your curiosity is valued!`;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      answer: geminiResponse,
      topChunks: topChunks.map(c => ({ text: c.text, url: c.url, similarity: c.similarity }))
    })
  };
}; 