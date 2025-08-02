const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const qiblahPath = path.join(__dirname, '../../data/qiblahDirection.json');

function loadCache() {
  if (!fs.existsSync(qiblahPath)) return {};
  return JSON.parse(fs.readFileSync(qiblahPath, 'utf-8'));
}

function saveCache(cache) {
  fs.writeFileSync(qiblahPath, JSON.stringify(cache, null, 2));
}

async function fetchFromAladhan(lat, lon) {
  const baseUrl = 'https://api.aladhan.com/v1/qibla'
  const url = `${baseUrl}/${lat}/${lon}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Aladhan API error: ${res.status}`);
  const json = await res.json();
  return {direction: parseFloat(json.data.direction.toFixed(2))}; // rounded to 2 decimal places
}

async function getQiblahDirection(lat, lon, force=false) {
  const cache = loadCache();
  if (cache["qiblah"] && !force) return cache["qiblah"];

  const direction = await fetchFromAladhan(lat, lon);
  cache["qiblah"] = direction;
  saveCache(cache);
  return direction;
} 

module.exports = getQiblahDirection;