const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

function mondayOf(date) {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return d
}

export function weekDates(date = new Date()) {
  const monday = mondayOf(date)
  return DAYS.map((day, index) => {
    const value = new Date(monday)
    value.setDate(monday.getDate() + index)
    return { day, date: value }
  })
}

export function weekKeyForDate(date = new Date()) {
  const monday = mondayOf(date)
  const thursday = new Date(monday)
  thursday.setDate(monday.getDate() + 3)
  const year = thursday.getFullYear()
  const yearStart = new Date(year, 0, 4, 12)
  const firstMonday = mondayOf(yearStart)
  const week = Math.floor((monday - firstMonday) / 604800000) + 1
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function shiftWeek(date, offset) {
  const result = new Date(date)
  result.setDate(result.getDate() + offset * 7)
  return result
}

export function formatDayDate(date) {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(date)
}
