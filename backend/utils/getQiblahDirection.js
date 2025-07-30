require('dotenv').config({ quiet: true });
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function getQiblahDirection() {
  const lat = process.env.LAT;
  const lon = process.env.LON;

  if (!lat || !lon) throw new Error('LAT and LON must be set in .env');

  const url = `https://api.aladhan.com/v1/qibla/${lat}/${lon}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Failed to fetch Qiblah direction: ${res.statusText}`);

  const data = await res.json();
  return {
    latitude: data.data.latitude,
    longitude: data.data.longitude,
    direction: parseFloat(data.data.direction.toFixed(2)) // Clean bearing
  };
}

module.exports = getQiblahDirection;

// Optional test
if (require.main === module) {
  getQiblahDirection().then(console.log).catch(console.error);
}