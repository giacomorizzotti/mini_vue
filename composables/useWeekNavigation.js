import { ref, computed } from 'vue'
import { toDateKey } from './useDateFormat'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function startOfWeek(date) {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

/**
 * ISO 8601 week number (1-53) for the week starting on the given Monday —
 * the week containing that week's Thursday determines the year/number, so
 * a week spanning a year boundary is correctly attributed to whichever
 * year owns most of it.
 * @param {Date} monday
 * @returns {number}
 */
function isoWeekNumber(monday) {
  const thursday = new Date(monday)
  thursday.setDate(thursday.getDate() + 3)
  const yearStart = new Date(thursday.getFullYear(), 0, 1)
  const days = Math.round((thursday - yearStart) / 86400000)
  return Math.ceil((days + 1) / 7)
}

/**
 * Reactive Monday-Sunday week cursor for any week-at-a-time UI (an
 * agenda, a weekly planner, ...) — defaults to the current week.
 * @returns {{
 *   weekStart: import('vue').Ref<Date>,
 *   weekDays: import('vue').ComputedRef<{date: Date, key: string, label: string}[]>,
 *   weekRangeLabel: import('vue').ComputedRef<string>,
 *   weekNumber: import('vue').ComputedRef<number>,
 *   shiftWeek: (deltaWeeks: number) => void,
 *   goToCurrentWeek: () => void,
 *   goToWeek: (date: Date) => void,
 * }}
 */
export function useWeekNavigation() {
  const weekStart = ref(startOfWeek(new Date()))

  function shiftWeek(deltaWeeks) {
    const next = new Date(weekStart.value)
    next.setDate(next.getDate() + deltaWeeks * 7)
    weekStart.value = next
  }

  function goToCurrentWeek() {
    weekStart.value = startOfWeek(new Date())
  }

  // Jumps to the Monday-Sunday week containing an arbitrary date — e.g.
  // for a caller restoring the visible week from a URL param. Snaps
  // through `startOfWeek` like every other mutator here, so a caller
  // can pass any day in the target week, not just its Monday.
  function goToWeek(date) {
    weekStart.value = startOfWeek(date)
  }

  const weekDays = computed(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart.value)
    date.setDate(date.getDate() + i)
    return { date, key: toDateKey(date), label: DAY_LABELS[i] }
  }))

  const weekRangeLabel = computed(() => {
    const first = weekDays.value[0].date
    const last = weekDays.value[6].date
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()}–${last.getDate()} ${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`
    }
    return `${first.getDate()} ${MONTH_NAMES[first.getMonth()]} – ${last.getDate()} ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`
  })

  const weekNumber = computed(() => isoWeekNumber(weekStart.value))

  return { weekStart, weekDays, weekRangeLabel, weekNumber, shiftWeek, goToCurrentWeek, goToWeek }
}
