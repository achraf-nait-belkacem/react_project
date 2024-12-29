const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectToDb() {
  try {
    await client.connect();
    db = client.db('memory_game');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Memory Game API is running' });
});

app.get('/api/scores', async (req, res) => {
  try {
    const scores = await db
      .collection('scores')
      .find({})
      .sort({ score: -1, moves: 1 })
      .limit(5)
      .toArray();
    
    res.json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

app.post('/api/scores', async (req, res) => {
  const { score, moves, timeCompleted, matchedPairs, totalPairs } = req.body;
  
  try {
    const result = await db.collection('scores').insertOne({
      score,
      moves,
      timeCompleted,
      matchedPairs,
      totalPairs,
      createdAt: new Date()
    });

    res.json({
      id: result.insertedId,
      message: 'Score saved successfully'
    });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// Start server after connecting to MongoDB
async function startServer() {
  await connectToDb();
  
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

startServer().catch(console.error); 