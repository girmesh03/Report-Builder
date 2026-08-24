/**
 * @module utils/ethiopianDate
 *
 * Ethiopian↔Gregorian conversion utilities (§46.6, §43.6): a
 * lightweight local utility, no npm package (§13.4). The Ethiopian
 * calendar is solar: twelve 30-day months plus the epagomenal month
 * Pagume (5 days, 6 in a leap year); leap years repeat every four
 * years without exception. Domain dates convert only through this
 * module — never native Date arithmetic at call sites (§9).
 */

/**
 * Julian Day Number of 1 Meskerem 1 (Incarnation Era), the Ethiopian
 * calendar epoch. Verified against the fixed anchors 1 Meskerem 2000 =
 * 12 Sep 2007 and 3 Nahase 2018 = 9 Aug 2026.
 * @type {number}
 */
const ETHIOPIAN_EPOCH_JDN = 1724221;

/**
 * @typedef {Object} EthiopianDate
 * @property {number} day - Day of the month, 1-based.
 * @property {number} month - Month, 1-based (1 = Meskerem … 13 = Pagume).
 * @property {number} year - Ethiopian (Incarnation Era) year.
 */

/**
 * Converts a proleptic Gregorian date to its Julian Day Number.
 * @param {number} year - Gregorian year.
 * @param {number} month - Gregorian month, 1-based.
 * @param {number} day - Gregorian day of month, 1-based.
 * @returns {number} The integer Julian Day Number.
 */
const gregorianToJDN = (year, month, day) => {
  const a = Math.floor((14 - month) / 12);
  const yy = year + 4800 - a;
  const mm = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

/**
 * Zero-pads a numeric date part to two digits.
 * @param {number} part - Day or month number.
 * @returns {string} Two-digit string.
 */
const pad2 = (part) => {
  return String(part).padStart(2, "0");
}

/**
 * Converts an Ethiopian date to the equivalent Gregorian `Date`
 * (local noon, clear of DST edges).
 * @param {EthiopianDate} ethDate - The Ethiopian date to convert.
 * @returns {Date} The Gregorian equivalent.
 */
export const ethiopianToGregorian = (ethDate) => {
  const { day, month, year } = ethDate;
  const jdn =
    ETHIOPIAN_EPOCH_JDN +
    (year - 1) * 365 +
    Math.floor(year / 4) +
    (month - 1) * 30 +
    (day - 1);
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return new Date(
    100 * b + d - 4800 + Math.floor(m / 10),
    m + 3 - 12 * Math.floor(m / 10) - 1,
    e - Math.floor((153 * m + 2) / 5) + 1,
    12,
  );
}

/**
 * Converts a JavaScript `Date` to its Ethiopian date.
 * @param {Date} jsDate - The Gregorian date to convert.
 * @returns {EthiopianDate} The Ethiopian equivalent.
 */
export const gregorianToEthiopian = (jsDate) => {
  const jdn = gregorianToJDN(
    jsDate.getFullYear(),
    jsDate.getMonth() + 1,
    jsDate.getDate(),
  );
  const days = jdn - ETHIOPIAN_EPOCH_JDN;
  const cycleIndex = Math.floor(days / 1461);
  const rem = days % 1461;
  const yearInCycle = rem >= 1096 ? 3 : rem >= 730 ? 2 : rem >= 365 ? 1 : 0;
  const dayInYear = yearInCycle === 3 ? rem - 1096 : rem - yearInCycle * 365;
  return {
    year: cycleIndex * 4 + yearInCycle + 1,
    month: Math.floor(dayInYear / 30) + 1,
    day: (dayInYear % 30) + 1,
  };
}

/**
 * The §43.6 display formatter: a stored date renders as its
 * Ethiopian `DD-MM-YY` (numeric notation, English chrome — ADR-011).
 * Null-safe: a missing value stays missing.
 * @param {Date|string} value - The stored date (UTC Date or ISO string).
 * @returns {string|null} `DD-MM-YY` or null when value is falsy.
 */
export const formatEthiopianDate = (value) => {
  if (!value) {
    return null;
  }
  const eth = gregorianToEthiopian(value instanceof Date ? value : new Date(value));
  return `${pad2(eth.day)}-${pad2(eth.month)}-${String(eth.year).slice(-2)}`;
}

/**
 * The §48.3 entry-datum formatter: `DD/MM/YYYY EC` in tabular digits
 * (e.g. `12/04/2018 EC`) — numerals only, no Amharic words (§7.6).
 * @param {Date|string} value - The date to render (defaults to today).
 * @returns {string} The long numeric Ethiopic datum.
 */
export const formatEthiopianDatum = (value = new Date()) => {
  const eth = gregorianToEthiopian(value instanceof Date ? value : new Date(value));
  return `${pad2(eth.day)}/${pad2(eth.month)}/${eth.year} EC`;
}
