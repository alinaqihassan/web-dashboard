require('dotenv').config({ quiet: true });
const express = require('express');
const router = express.Router();
const getQiblahDirection = require('../utils/getQiblahDirection');

const getEnv = key => process.env[key] || '';

router.get('/', async (req, res) => {
  const lat = getEnv('LAT');
  const lon = getEnv('LON');
  const force = (req.query.force === 'true');

  if (!lat || !lon) throw new Error('LAT and LON must be set in .env');

  try {
    const direction = await getQiblahDirection(lat, lon, force);
    res.json({latitude: lat, longitude: lon, direction});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;