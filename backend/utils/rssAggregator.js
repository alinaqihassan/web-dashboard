const xml2js = require('xml2js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { DateTime } = require("luxon");

/**
 * Fetch and parse a single RSS feed URL using native fetch.
 * @param {string} url - The RSS feed URL.
 * @returns {Promise<Object>} - Parsed RSS feed items.
 */
async function fetchFeed(name, url) {
  try {
    const resp = await fetch(url);
    const data = await resp.text();
    const parsed = await xml2js.parseStringPromise(data, { trim: true, explicitArray: false });
    // Standardize on 'items' array
    const channel = parsed.rss?.channel || parsed.feed;
    let items = channel?.item || channel?.entry || [];
    if (!Array.isArray(items)) items = [items];
    return items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: (
        name === "PressTV"
          ? DateTime.fromISO(item.link.slice(26, 36).replaceAll('/', '-') + "T12:00:00", { zone: 'Europe/London' }).toISO()
          : (item.pubDate || item.updated || item.published)
      ),
      description: item.description || item.summary || '',
      sourceName: name,
      sourceUrl: url,
    }));
  } catch (err) {
    // Optionally log error
    console.log(err)
    return [];
  }
}

/**
 * Aggregate multiple RSS feeds.
 * @param {Object[]} feeds - Object with feed names and URLs.
 * @returns {Promise<Object[]>} - Aggregated, sorted feed items.
 */
async function aggregateFeeds(feeds) {
  const feedNames = Object.keys(feeds)
  const allItems = (
    await Promise.all(feedNames.map(name => fetchFeed(name, feeds[name])))
  ).flat();
  // Sort items by date (descending)
  return allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

module.exports = { aggregateFeeds };