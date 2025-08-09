const express = require('express');
const router = express.Router();
const { aggregateFeeds } = require('../utils/rssAggregator');

// Example list of RSS feed URLs (replace or make dynamic as needed)
const ALL_FEEDS = {
  "New York Times": 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  "BBC News":	'https://feeds.bbci.co.uk/news/rss.xml',
  "Euronews": 'https://www.euronews.com/rss',
  "Mehr News": 'https://en.mehrnews.com/rss',
  "CGTN": 'https://www.cgtn.com/subscribe/rss/section/world.xml',
  "Tehran Times": 'https://www.tehrantimes.com/rss',
  "The Grayzone": 'https://thegrayzone.com/rss',
  "Geopolitical Economy Report": 'https://geopoliticaleconomy.com/rss',
  "Le Monde": 'https://www.lemonde.fr/en/rss/une.xml',
  "Quds News Network": 'https://qudsnen.co/rss',
  "Al Jazeera": 'https://www.aljazeera.com/rss',
  "Kernow Damo": 'https://web-cdn.bsky.app/profile/did:plc:odvg7gdl2ha7xk32bones7yb/rss',
  "PressTV": 'https://www.presstv.ir/rss.xml',
  "SKWAWKBOX": 'https://skwawkbox.org/rss',
};

/**
 * GET /rss/aggregate
 * Query param: feeds=comma-separated-name-list (optional, defaults to all feeds)
 * Returns: aggregated RSS items
 */
router.get('/', async (req, res) => {
  const feeds = req.query.feeds
    ? Object.fromEntries(
      Object.entries(ALL_FEEDS).filter(
        ([key]) => req.query.feeds.split(',').includes(key)
      )
    )
    : ALL_FEEDS;
  try {
    const items = await aggregateFeeds(feeds);
    res.json({ feeds, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to aggregate feeds.' });
  }
});

module.exports = router;