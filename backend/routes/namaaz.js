// backend/routes/namaaz.js
const express = require('express');
const router = express.Router();
const getNamaazTimes = require('../utils/getNamaazTimes');

router.get('/', async (req, res) => {
  const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
  const force = (req.query.force === 'true');
  try {
    const timings = await getNamaazTimes(dateStr, force);
    res.json({ date: dateStr, timings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
