import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.js';

// Initialize dotenv
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Add your frontend URL
  credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

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
    const scores = await mongoose.connection.db
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
    const result = await mongoose.connection.db.collection('scores').insertOne({
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

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password, // In a real app, you should hash the password
      highScore: 0
    });

    await newUser.save();
    console.log('New user created:', { name, email });

    res.status(201).json({ 
      message: "User created successfully",
      user: {
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt with:', { email, password });

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    console.log('Comparing passwords:', {
      provided: password,
      stored: user.password
    });
    
    if (user.password !== password) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: "Invalid password" });
    }

    // Login successful
    console.log('Login successful for:', email);
    res.json({
      message: "Login successful",
      token: "dummy-token",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        highScore: user.highScore
      }
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ 
      message: "Server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's high score
app.get("/api/users/:email/highscore", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ highScore: user.highScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user's high score
app.put("/api/users/:email/highscore", async (req, res) => {
  const { score } = req.body;

  try {
    console.log('Updating high score:', { email: req.params.email, score });

    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only update if new score is higher
    if (score > user.highScore) {
      user.highScore = score;
      await user.save();
      console.log('Updated high score for user:', { email: user.email, newScore: score });
    }

    res.json({ 
      message: "High score updated successfully",
      highScore: user.highScore 
    });
  } catch (error) {
    console.error('Error updating high score:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get leaderboard (only highest score per user)
app.get("/api/leaderboard", async (req, res) => {
  try {
    // Get all users with their high scores
    const topPlayers = await User.find({ highScore: { $gt: 0 } })  // Only get users with scores
      .select('name email highScore')
      .sort({ highScore: -1 })
      .limit(10);

    console.log('Found top players:', topPlayers);

    // Format the response
    const formattedTopPlayers = topPlayers.map(player => ({
      name: player.name,
      score: player.highScore
    }));

    res.json(formattedTopPlayers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});
