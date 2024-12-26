const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database(':memory:'); // In-memory database for simplicity

app.use(bodyParser.json());

// Create scores table
db.serialize(() => {
  db.run('CREATE TABLE scores (id INTEGER PRIMARY KEY, name TEXT, score INTEGER)');
});

// Endpoint to save the score
app.post('/api/scores', (req, res) => {
  const { name, score } = req.body;
  db.run('INSERT INTO scores (name, score) VALUES (?, ?)', [name, score], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// Endpoint to get all scores
app.get('/api/scores', (req, res) => {
  db.all('SELECT * FROM scores ORDER BY score DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
