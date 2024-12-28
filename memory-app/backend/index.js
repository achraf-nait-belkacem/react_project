//const express = require('express');
//const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create SQLite database connection
const db = new sqlite3.Database('./scores.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    // Create scores table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        score INTEGER NOT NULL,
        moves INTEGER NOT NULL,
        timeCompleted TEXT NOT NULL,
        matchedPairs INTEGER,
        totalPairs INTEGER
      )
    `);
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Memory Game API is running' });
});

app.get('/api/scores', (req, res) => {
  db.all(
    'SELECT * FROM scores ORDER BY score DESC, moves ASC LIMIT 5',
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

app.post('/api/scores', (req, res) => {
  const { score, moves, timeCompleted, matchedPairs, totalPairs } = req.body;
  
  db.run(
    `INSERT INTO scores (score, moves, timeCompleted, matchedPairs, totalPairs)
     VALUES (?, ?, ?, ?, ?)`,
    [score, moves, timeCompleted, matchedPairs, totalPairs],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        message: 'Score saved successfully'
      });
    }
  );
});

// Serve static files from the React app
app.use(express.static('../memory-app/dist'));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../memory-app/dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 