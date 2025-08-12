require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection setup using environment variables
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Create notes table if not exists
pool.query(`CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL
)`);

// Get all notes
app.get('/api/notes', async (req, res) => {
  const result = await pool.query('SELECT * FROM notes ORDER BY id DESC');
  res.json(result.rows);
});

// Add a new note
app.post('/api/notes', async (req, res) => {
  const { title, content } = req.body;
  const result = await pool.query(
    'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
    [title, content]
  );
  res.json(result.rows[0]);
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM notes WHERE id = $1', [id]);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
