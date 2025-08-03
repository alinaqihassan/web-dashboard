require('dotenv').config({ quiet: true });
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.get('/', async (req, res) => {
  const lat = process.env.LAT;
  const lon = process.env.LON;
  if (!lat || !lon) return res.status(500).json({ error: 'LAT and LON not set in .env' });

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`);
    const data = await response.json();
    const current = data.current;
    res.json({
      temperature: current.temperature_2m,
      windspeed: current.windspeed_10m,
      code: current.weathercode
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
