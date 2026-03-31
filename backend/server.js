const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'submissions.json');

// Load existing data
let submissions = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    submissions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading data file', err);
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
}

// POST endpoint – the frontend expects this
app.post('/api/submit', (req, res) => {
  const { name, aNumber, suggestion } = req.body;
  if (!name || !aNumber || !suggestion) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const existing = submissions.find(
    (entry) => entry.name === name && entry.aNumber === aNumber
  );

  if (existing) {
    existing.points = (existing.points || 0) + 1;
    saveData();
    res.json({ success: true, updated: true });
  } else {
    submissions.push({
      name,
      aNumber,
      suggestion,
      points: 1,
      timestamp: new Date().toISOString(),
    });
    saveData();
    res.json({ success: true, updated: false });
  }
});

// Optional: for debugging
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});