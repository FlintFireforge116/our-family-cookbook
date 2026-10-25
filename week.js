export const WEEK_DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

export function emptyPlanner() {
  return {
    meals: [],
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  }
}

export function normalizePlanner(planner = {}) {
  const normalized = emptyPlanner()
  const meals = Array.isArray(planner.meals) ? planner.meals.filter(value => typeof value === 'string' && value) : []
  const assigned = []
  for (const day of WEEK_DAYS) {
    const value = typeof planner?.[day] === 'string' && planner[day] ? planner[day] : null
    normalized[day] = value
    if (value) assigned.push(value)
  }
  normalized.meals = [...new Set([...meals, ...assigned])]
  return normalized
}

export function addMealToPlanner(planner, recipeId) {
  const next = normalizePlanner(planner)
  if (!recipeId) return next
  if (!next.meals.includes(recipeId)) next.meals.push(recipeId)
  return next
}

export function placeMealOnDay(planner, recipeId, day) {
  if (!WEEK_DAYS.includes(day)) return normalizePlanner(planner)
  const next = addMealToPlanner(planner, recipeId)
  next[day] = recipeId || null
  return next
}

export function moveMealBetweenDays(planner, fromDay, toDay) {
  const next = normalizePlanner(planner)
  if (!WEEK_DAYS.includes(fromDay) || !WEEK_DAYS.includes(toDay) || fromDay === toDay) return next
  const recipeId = next[fromDay]
  if (!recipeId) return next
  next[fromDay] = null
  next[toDay] = recipeId
  if (!next.meals.includes(recipeId)) next.meals.push(recipeId)
  return next
}

export function plannerDaysForRecipe(planner, recipeId) {
  const next = normalizePlanner(planner)
  return WEEK_DAYS.filter(day => next[day] === recipeId)
}

// Kept as an alias for older callers/backups; V0.3 allows the same meal on multiple days.
export function assignMealToDay(planner, recipeId, day) {
  return placeMealOnDay(planner, recipeId, day)
}

export function clearPlannerDay(planner, day) {
  const next = normalizePlanner(planner)
  if (WEEK_DAYS.includes(day)) next[day] = null
  return next
}

export function removeMealFromPlanner(planner, recipeId) {
  const next = normalizePlanner(planner)
  next.meals = next.meals.filter(id => id !== recipeId)
  for (const day of WEEK_DAYS) {
    if (next[day] === recipeId) next[day] = null
  }
  return next
}

export function plannerDayForRecipe(planner, recipeId) {
  const normalized = normalizePlanner(planner)
  return WEEK_DAYS.find(day => normalized[day] === recipeId) ?? null
}

function mondayOf(date) {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return d
}

export function weekDates(date = new Date()) {
  const monday = mondayOf(date)
  return WEEK_DAYS.map((day, index) => {
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
