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

// Add validation middleware
const validateScore = (req, res, next) => {
  const { playerName, score, moves, timeCompleted, matchedPairs, totalPairs } = req.body;

  // Validate player name
  if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
    return res.status(400).json({ error: 'Valid player name is required' });
  }

  if (playerName.trim().length > 20) {
    return res.status(400).json({ error: 'Player name must be 20 characters or less' });
  }

  // Validate score
  if (typeof score !== 'number' || score < 0) {
    return res.status(400).json({ error: 'Valid score is required' });
  }

  // Validate moves
  if (typeof moves !== 'number' || moves < 1) {
    return res.status(400).json({ error: 'Valid number of moves is required' });
  }

  // Validate matched pairs
  if (typeof matchedPairs !== 'number' || matchedPairs < 0) {
    return res.status(400).json({ error: 'Valid matched pairs count is required' });
  }

  // Validate time completed
  if (!timeCompleted || !Date.parse(timeCompleted)) {
    return res.status(400).json({ error: 'Valid completion time is required' });
  }

  next();
};

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

app.post('/api/scores', validateScore, async (req, res) => {
  const { playerName, score, moves, timeCompleted, matchedPairs, totalPairs } = req.body;
  
  try {
    const result = await db.collection('scores').insertOne({
      playerName: playerName.trim(),
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