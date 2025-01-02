import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import User from './models/user.js';

// Initialize dotenv
dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

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

const connectToDb = async () => {
  try {
    await mongoose.connect('mongodb+srv://achrafoonb:azeQSD147-@cluster0.rtwak.mongodb.net/memory_game', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

connectToDb();

const addUser = async () => {
  try {
    const newUser = new User({
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      highScore: 100,
    });

    const savedUser = await newUser.save();
    console.log('User added:', savedUser);
  } catch (err) {
    console.error('Error adding user:', err);
  }
};

addUser();

const fetchUsers = async () => {
  try {
    const users = await User.find();
    console.log('Users:', users);
  } catch (err) {
    console.error('Error fetching users:', err);
  }
};

fetchUsers();

const updateHighScore = async (email, newHighScore) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { highScore: newHighScore },
      { new: true }
    );
    console.log('Updated user:', updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
  }
};

updateHighScore('john.doe@example.com', 200);

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
