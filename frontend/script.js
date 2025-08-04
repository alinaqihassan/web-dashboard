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
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Light snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Slight to moderate thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  };
  const desc = codeMap[data.code] || "Unknown";
  document.getElementById("weather-output").innerHTML = `
    <p class="text-2xl font-bold">${data.temperature}°C</p>
    <p class="text-sm">${desc}</p>
    <p class="text-sm">Wind: ${data.windspeed} km/h</p>
  `;
}

async function fetchHijriDate() {
  let hijriStr = 'N/A';
  try {
    const res = await fetch('/api/hijri');
    const data = await res.json();
    const { hijriDay, hijriMonth, hijriYear } = data;
    hijriStr = `${hijriDay} ${hijriMonth} ${hijriYear}`;
  } catch (err) {
    hijriStr = 'Error fetching Hijri date';
  }
  document.getElementById("hijri").textContent = hijriStr;
}

function scheduleMidnightHijriUpdate() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0); // Midnight

  const msUntilMidnight = tomorrow - now;

  setTimeout(async () => {
    await fetchHijriDate(); // refresh Hijri date
    await fetchNamaazTimes(); // refresh Namaaz times
    scheduleMidnightHijriUpdate(); // Schedule again
  }, msUntilMidnight);
}

function updateClock() {
  const now = new Date();

  // Time
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
  document.getElementById('time').textContent = timeStr;

  // Gregorian (Mīladī)
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' });
  const day = now.getDate();
  const month = now.toLocaleDateString('en-GB', { month: 'long' });
  const year = now.getFullYear();
  const gregorianStr = `${weekday}, ${day} ${month} ${year}`;

  // Solar Hijri (Shamsī)
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

  document.getElementById("gregorian").textContent = gregorianStr;
  document.getElementById("shamsi").textContent = shamsiStr;
}

async function loadTasks() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  try {
    const res = await fetch('/api/todo/list');
    const data = await res.json();
    if (!data.success) throw new Error('Failed to load tasks');

    data.tasks.forEach(({ id, task, done }) => {
      const li = document.createElement('li');
      li.className = 'flex items-center space-x-2';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = done;
      checkbox.addEventListener('change', async () => {
        try {
          await fetch('/api/todo/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, done: checkbox.checked }),
          });
        } catch (err) {
          alert('Failed to update task status.');
          checkbox.checked = !checkbox.checked; // revert on fail
        }
      });

      const span = document.createElement('span');
      span.textContent = task;

      const delete_button = document.createElement('button');
      delete_button.className = 'bg-red-600 rounded px-1';
      delete_button.textContent = 'delete'
      delete_button.addEventListener('click', async () => {
        try {
          await fetch('/api/todo/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          });
        } catch (err) {
          alert('Failed to delete task');
        }
        try {
          await loadTasks();  // Refresh the list after deleting
        } catch (err) {
          alert('Failed to sync with Notion.');
          console.error(err);
        }
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(delete_button);
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('todo-add').addEventListener('click', async () => {
  const input = document.getElementById('todo-input');
  const task = input.value.trim();
  if (!task) return;

  try {
    const res = await fetch('/api/todo/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    input.value = '';
    await loadTasks();  // Refresh the list after adding
  } catch (err) {
    alert('Failed to sync with Notion.');
    console.error(err);
  }
});

setInterval(updateClock, 100);
setInterval(fetchWeather, 600000)
setInterval(loadTasks, 600000)

fetchHijriDate();
fetchWeather();
fetchNamaazTimes();
fetchQiblahDirection();
loadTasks();
updateClock();