// backend/utils/getNamaazTimes.js
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const namaazPath = path.join(__dirname, '../../data/namaazTimes.json');

const getEnv = key => process.env[key] || '';

function loadCache() {
  if (!fs.existsSync(namaazPath)) return {};
  return JSON.parse(fs.readFileSync(namaazPath, 'utf-8'));
}

function saveCache(cache) {
  fs.writeFileSync(namaazPath, JSON.stringify(cache, null, 2));
}

function selectedTimings(RawNamaazTimings) {
  const selectedKeys = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Sunset", "Maghrib", "Isha", "Midnight"];
  const selected = Object.fromEntries(
    selectedKeys.map(key => [key, RawNamaazTimings[key]])
  );
  return selected;
}

async function fetchFromAladhan(dateStr) {
  const baseUrl = 'https://api.aladhan.com/v1/timings';
  const lat = getEnv('LAT');
  const lon = getEnv('LON');
  const url = `${baseUrl}/${dateStr}?latitude=${lat}&longitude=${lon}&midnightMode=1&latitudeAdjustmentMethod=1&method=99&methodSettings=16,15 min,14`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Aladhan API error: ${res.status}`);
  const json = await res.json();
  return selectedTimings(json.data.timings);
}

async function getNamaazTimes(dateStr, force=false) {
  const cache = loadCache();
  if (cache[dateStr] && !force) return cache[dateStr];

  const timings = await fetchFromAladhan(dateStr);
  cache[dateStr] = timings;
  saveCache(cache);
  return timings;
}

module.exports = getNamaazTimes;

// Run test only if this is the main module
if (require.main === module) {
  getNamaazTimes("2025-08-01").then(timings => {
    console.log(timings);
  });
}