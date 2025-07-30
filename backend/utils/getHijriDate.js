const fs = require('fs');
const path = require('path');
const { differenceInCalendarDays, parseISO } = require('date-fns');

const hijriWeekdays = [
  'Yawm al-ʾAħad',
  'Yawm al-Iþnayn',
  'Yawm ath-Þulāthāʾ',
  'Yawm al-ʾArbiʿāʾ',
  'Yawm al-Ḵamīs',
  'Yawm al-Jumʿah',
  'Yawm as-Sabt'
];

const hijriMonths = [
  'Muħarram',
  'Safar',
  'Rabīʿ al-ʾAwwal',
  'Rabīʿ al-Þānī',
  'Jumādā al-ʾŪlā',
  'Jumādā al-Þāniyah',
  'Rajab',
  'Shaʿbān',
  'Ramaḍān',
  'Shawwāl',
  'Ðū \'l-Qaʿdah',
  'Ðū \'l-Ħijjah'
];

function getHijriDateForGregorian(inputDateStr) {
  const hijriStartPath = path.join(__dirname, '../../data/hijriStart.json');
  const hijriStartData = JSON.parse(fs.readFileSync(hijriStartPath, 'utf-8'));

  const inputDate = new Date(inputDateStr + 'T00:00:00Z');

  // Get sorted Gregorian start dates
  const sortedStarts = Object.keys(hijriStartData)
    .map(date => new Date(date + 'T00:00:00Z')) // UTC midnight
    .sort((a, b) => a - b);

  // Find latest Hijri start date ≤ inputDate
  const currentStartDate = [...sortedStarts]
    .reverse()
    .find(date => date <= inputDate);

  if (!currentStartDate) {
    throw new Error('No Hijri month start found before this date.');
  }

  const currentStartStr = currentStartDate.toISOString().slice(0, 10);

  const currentHijri = hijriStartData[currentStartStr];
  if (!currentHijri) {
    throw new Error(`No Hijri mapping found for Gregorian date ${currentStartStr}`);
  }

  const [hYear, hMonth, hDay] = currentHijri.split('-').map(Number);

  // Find next month start for month-length estimation
  const currentIndex = sortedStarts.findIndex(date => date.getTime() === currentStartDate.getTime());
  const nextStartDate = sortedStarts[currentIndex + 1];

  const dayOffset = differenceInCalendarDays(inputDate, currentStartDate);
  let day = hDay + dayOffset;
  let month = hMonth;
  let year = hYear;

  let maxMonthLength = 30; // Default
  if (nextStartDate) {
    maxMonthLength = differenceInCalendarDays(nextStartDate, currentStartDate);
  }

  if (day > maxMonthLength) {
    day -= maxMonthLength;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  const weekday = hijriWeekdays[inputDate.getDay()];
  const monthName = hijriMonths[month - 1];

  return {
    hijri: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    hijriDay: day,
    hijriMonth: monthName,
    hijriMonthNumber: month,
    hijriYear: year,
    weekday
  };
}

module.exports = getHijriDateForGregorian;

// Run test only if this is the main module
if (require.main === module) {
  console.log(getHijriDateForGregorian("2025-07-30"));
}

