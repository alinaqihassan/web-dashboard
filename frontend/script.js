async function fetchNamaazTimes() {
  try {
    const res = await fetch('/api/namaaz');
    const data = await res.json();
    const ul = document.getElementById('namaaz-output');
    ul.innerHTML = '';
    for (const [name, time] of Object.entries(data.timings || {})) {
      const li = document.createElement('li');
      li.textContent = `${name}: ${time}`;
      ul.appendChild(li);
    }
  } catch (err) {
    document.getElementById('namaaz-output').textContent = 'Error fetching Namaaz times';
  }
}

async function fetchQiblahDirection() {
  try {
    const res = await fetch('/api/qiblah');
    const data = await res.json();
    document.getElementById('qiblah-output').textContent =
      `${data.direction}°`;
  } catch (err) {
    document.getElementById('qiblah-output').textContent = 'Error fetching Qiblah direction';
  }
}

async function fetchWeather() {
  const res = await fetch('/api/weather');
  const data = await res.json();
  const codeMap = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    61: "Light rain",
    71: "Light snow",
    80: "Rain showers",
    95: "Thunderstorm",
    // ... add more as needed
  };
  const desc = codeMap[data.code] || "Unknown";
  document.getElementById("weather-output").innerHTML = `
    <p class="text-2xl font-bold">${data.temperature}°C</p>
    <p class="text-sm">${desc}</p>
    <p class="text-sm">Wind: ${data.windspeed} km/h</p>
  `;
}

async function updateClock() {
  const now = new Date();

  // 🕰 Time
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
  document.getElementById('time').textContent = timeStr;

  // 📅 Gregorian (Miladi)
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' });
  const day = now.getDate();
  const month = now.toLocaleDateString('en-GB', { month: 'long' });
  const year = now.getFullYear();
  const gregorianStr = `${weekday}, ${day} ${month} ${year}`;

  // ☀️ Shamsī (Solar Hijri)
  const shamsiFormatter = new Intl.DateTimeFormat('en-GB-u-ca-persian', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
  const shamsiParts = shamsiFormatter.formatToParts(now);
  const shamsiMap = Object.fromEntries(shamsiParts.map(p => [p.type, p.value]));

  const shamsiMonthNum = Number(shamsiMap.month);

  const shamsiMonthMap = {
    '1': 'Farvardīn', '2': 'Ordībehesht', '3': 'Khordād', '4': 'Tīr',
    '5': 'Mordād', '6': 'Shahrīvar', '7': 'Mehr', '8': 'Ābān',
    '9': 'Āzar', '10': 'Dey', '11': 'Bahman', '12': 'Esfand'
  };

  const shamsiMonthName = shamsiMonthMap[shamsiMonthNum] || 'Unknown';

  const shamsiStr = `${shamsiMap.day} ${shamsiMonthName} ${shamsiMap.year}`;

  // 🌙 Qamarī (Hijri)
  let hijriStr = 'N/A';
  try {
    const res = await fetch('/api/hijri');
    const data = await res.json();
    const { hijriDay, hijriMonth, hijriYear } = data;
    hijriStr = `${hijriDay} ${hijriMonth} ${hijriYear}`;
  } catch (err) {
    hijriStr = 'Error fetching Hijri date';
  }

  // 📜 Final string
  const dateStr = `${gregorianStr} | ${shamsiStr} | ${hijriStr}`;
  document.getElementById('date').textContent = dateStr;
}


setInterval(updateClock, 1000);
setInterval(fetchWeather, 600000)
setInterval(fetchNamaazTimes, 60000)
setInterval(fetchQiblahDirection, 3600000)

fetchWeather();
fetchNamaazTimes();
fetchQiblahDirection();
updateClock();