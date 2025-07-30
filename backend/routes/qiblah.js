const express = require('express');
const router = express.Router();
const getQiblahDirection = require('../utils/getQiblahDirection');

router.get('/', async (req, res) => {
  try {
    const direction = await getQiblahDirection();
    res.json(direction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;