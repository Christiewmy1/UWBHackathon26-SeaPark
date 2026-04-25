/**
 * Returns true when today is Sunday.
 * @param {Date} date
 * @returns {boolean}
 */
export function isSunday(date) {
  return date.getDay() === 0;
}

/**
 * Returns true when date is New Year's Day.
 * @param {Date} date
 * @returns {boolean}
 */
export function isNewYearsDay(date) {
  return date.getMonth() === 0 && date.getDate() === 1;
}

/**
 * Returns true when date is Independence Day.
 * @param {Date} date
 * @returns {boolean}
 */
export function isIndependenceDay(date) {
  return date.getMonth() === 6 && date.getDate() === 4;
}

/**
 * Returns true when date is Christmas Day.
 * @param {Date} date
 * @returns {boolean}
 */
export function isChristmas(date) {
  return date.getMonth() === 11 && date.getDate() === 25;
}

/**
 * Gets Memorial Day (last Monday of May) for a year.
 * @param {number} year
 * @returns {Date}
 */
export function getMemorialDay(year) {
  const date = new Date(year, 4, 31);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

/**
 * Gets Labor Day (first Monday of September) for a year.
 * @param {number} year
 * @returns {Date}
 */
export function getLaborDay(year) {
  const date = new Date(year, 8, 1);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

/**
 * Gets Thanksgiving (4th Thursday of November) for a year.
 * @param {number} year
 * @returns {Date}
 */
export function getThanksgiving(year) {
  const date = new Date(year, 10, 1);
  while (date.getDay() !== 4) {
    date.setDate(date.getDate() + 1);
  }
  date.setDate(date.getDate() + 21);
  return date;
}

/**
 * Returns true if dates are on the same calendar day.
 * @param {Date} a
 * @param {Date} b
 * @returns {boolean}
 */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Returns true for Seattle meter-free holidays and Sundays.
 * @param {Date} [date=new Date()]
 * @returns {boolean}
 */
export function isSeattleMeterFreeDay(date = new Date()) {
  const year = date.getFullYear();
  return (
    isSunday(date) ||
    isNewYearsDay(date) ||
    isIndependenceDay(date) ||
    isChristmas(date) ||
    isSameDay(date, getMemorialDay(year)) ||
    isSameDay(date, getLaborDay(year)) ||
    isSameDay(date, getThanksgiving(year))
  );
}

/**
 * Resolves lot meter-free state by category.
 * Garages are never meter-free.
 * @param {"free"|"metered"|"garage"|string} category
 * @param {Date} [date=new Date()]
 * @returns {boolean}
 */
export function getMeterFreeToday(category, date = new Date()) {
  if (category === "garage") {
    return false;
  }
  if (category === "free") {
    return true;
  }
  return isSeattleMeterFreeDay(date);
}
