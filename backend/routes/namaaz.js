require('dotenv').config({ quiet: true });
const express = require('express');
const router = express.Router();
const getNamaazTimes = require('../utils/getNamaazTimes');

const getEnv = key => process.env[key] || '';

router.get('/', async (req, res) => {
  const lat = getEnv('LAT');
  const lon = getEnv('LON');
  const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
  const force = (req.query.force === 'true');

  if (!lat || !lon) throw new Error('LAT and LON must be set in .env');
  
  try {
    const timings = await getNamaazTimes(lat, lon, dateStr, force);
    res.json({ date: dateStr, latitude: lat, longitude: lon, timings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
