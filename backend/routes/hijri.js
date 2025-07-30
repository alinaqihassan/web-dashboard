const express = require('express');
const router = express.Router();
const getHijriDate = require('../utils/getHijriDate');

router.get('/', (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  try {
    const result = getHijriDate(date);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

