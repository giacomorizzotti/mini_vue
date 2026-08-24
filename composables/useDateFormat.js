const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Format a date as "13 January 2026".
 * @param {string|Date} value - an ISO date string ('2026-02-15' or a full
 *   datetime) or a Date object. Returns '' for empty/invalid input.
 * @returns {string}
 */
function formatDate(value) {
  if (!value) return ''

  // Plain 'YYYY-MM-DD' dates (e.g. Django REST Framework's DateField) must
  // be parsed as local calendar dates, not UTC — `new Date('YYYY-MM-DD')`
  // parses as UTC midnight, which rolls back a day in timezones behind UTC.
  const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (isoDateOnly) {
    const [, year, month, day] = isoDateOnly
    return `${Number(day)} ${MONTH_NAMES[Number(month) - 1]} ${year}`
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Format a date's time-of-day as "09:00" (24h, zero-padded).
 * @param {string|Date} value - an ISO datetime string or a Date object.
 *   Returns '' for empty/invalid input.
 * @returns {string}
 */
function formatTime(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * Format a duration given in minutes as "2h 30m" (omits the hours part
 * when zero, e.g. "45m"; omits the minutes part when zero, e.g. "2h").
 * @param {number} totalMinutes
 * @returns {string}
 */
function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

/**
 * Render a date as a local-calendar "YYYY-MM-DD" key, e.g. for grouping
 * items by day or as a native date input's value. Deliberately built from
 * the Date object's local getters rather than `toISOString().slice(0, 10)`,
 * which would shift to UTC and roll back a day in timezones behind UTC.
 * @param {string|Date} value
 * @returns {string}
 */
export function toDateKey(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Inverse of `toDateKey` — parses a 'YYYY-MM-DD' key back into a local
 * Date at midnight. Built from the string's own numeric parts rather than
 * `new Date(value)`, which parses a date-only string as UTC midnight and
 * would roll back a day in timezones behind UTC. Returns null for
 * empty/invalid input (e.g. a missing or malformed URL query param).
 * @param {string} value
 * @returns {Date|null}
 */
function fromDateKey(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

/**
 * Render a date as "YYYY-MM-DDTHH:mm" in local time, the value format a
 * native `<input type="datetime-local">` expects — built from local
 * getters for the same reason as `toDateKey`.
 * @param {string|Date} value
 * @returns {string}
 */
function toDatetimeLocal(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${toDateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Inverse of `toDatetimeLocal` — parses a native `<input type="datetime-
 * local">` value (no timezone designator, so JS's `Date` constructor reads
 * it as local time) into a UTC ISO string safe to send to an API. Sending
 * the raw datetime-local string instead would let a server with a
 * different default timezone (e.g. one running `TIME_ZONE = 'UTC'`)
 * misinterpret it, shifting the saved time by the gap between the
 * server's zone and the browser's. Returns '' for empty/invalid input.
 * @param {string} value
 * @returns {string}
 */
function fromDatetimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

/**
 * Combine one calendar date with separate start/end time-of-day strings
 * ('HH:mm') into a `{startedAt, endedAt}` pair of UTC ISO strings, for a
 * "pick a date, then a start and end time" form where the two times might
 * span midnight. `endsNextDay` is an explicit caller-supplied flag, not
 * inferred by comparing the two time strings -- inferring "end <= start
 * means overnight" would silently reinterpret an ordinary same-day typo
 * (meant 17:00, typed 07:00) as a real ~14-hour overnight entry instead of
 * leaving it for the caller's own end-after-start validation to catch, the
 * same way it already does today. Pass `true` only when the caller has its
 * own unambiguous signal that the range is meant to cross midnight (e.g. an
 * explicit "ends next day" checkbox the user ticked, or a drag gesture that
 * reached a day boundary — see `useTimeGrid`'s `minutesToDayOffsetAndLabel`
 * for turning that into a boolean).
 * @param {string} dateKey - 'YYYY-MM-DD', the start date.
 * @param {string} startTime - 'HH:mm'.
 * @param {string} endTime - 'HH:mm'.
 * @param {boolean} [endsNextDay]
 * @returns {{startedAt: string, endedAt: string}}
 */
function fromDateAndTimeRange(dateKey, startTime, endTime, endsNextDay = false) {
  const startedAt = fromDatetimeLocal(`${dateKey}T${startTime}`)
  let endDateKey = dateKey
  if (endsNextDay) {
    const d = fromDateKey(dateKey)
    d.setDate(d.getDate() + 1)
    endDateKey = toDateKey(d)
  }
  const endedAt = fromDatetimeLocal(`${endDateKey}T${endTime}`)
  return { startedAt, endedAt }
}

/**
 * Format how long ago a date was as "5 minutes ago", "3 hours ago", "2 days
 * ago", etc., falling back to `formatDate` beyond a month since "N months
 * ago" gets imprecise. Returns '' for empty/invalid input, "just now" for
 * anything under a minute, and treats a future date as "just now" too
 * (e.g. small clock drift between client and server).
 * @param {string|Date} value
 * @returns {string}
 */
function formatTimeAgo(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'

  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [name, secondsInUnit] of units) {
    const count = Math.floor(seconds / secondsInUnit)
    if (count >= 1) return `${count} ${name}${count === 1 ? '' : 's'} ago`
  }
  return 'just now'
}

/**
 * Composable for formatting dates consistently across the app.
 * @returns {Object} Date formatting utilities
 */
export function useDateFormat() {
  return {
    formatDate, formatTime, formatDuration, formatTimeAgo,
    toDateKey, fromDateKey, toDatetimeLocal, fromDatetimeLocal, fromDateAndTimeRange,
  }
}

export { fromDateAndTimeRange }
