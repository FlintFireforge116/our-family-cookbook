import test from 'node:test'
import assert from 'node:assert/strict'
import { weekKeyForDate, weekDates, normalizePlanner, addMealToPlanner, assignMealToDay, removeMealFromPlanner } from '../src/domain/week.js'
import { hasFirebaseConfig } from '../src/data/firebaseRepository.js'
import { validateImageMeta } from '../src/domain/image.js'

test('weekKeyForDate uses ISO week and Monday start', () => {
  assert.equal(weekKeyForDate(new Date('2026-10-25T12:00:00Z')), '2026-W43')
  assert.equal(weekDates(new Date('2026-10-25T12:00:00Z'))[0].day, 'monday')
})

test('firebase config is considered usable only with required fields', () => {
  assert.equal(hasFirebaseConfig({ apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' }), true)
  assert.equal(hasFirebaseConfig({ apiKey: 'a', projectId: 'c' }), false)
})

test('image validation rejects non-images and very large source files', () => {
  assert.throws(() => validateImageMeta({ type: 'application/pdf', size: 10 }), /image/i)
  assert.throws(() => validateImageMeta({ type: 'image/jpeg', size: 16 * 1024 * 1024 }), /15 MB/i)
  assert.doesNotThrow(() => validateImageMeta({ type: 'image/jpeg', size: 2 * 1024 * 1024 }))
})


test('planner normalization keeps old day data and carries assigned meals into the weekly pool', () => {
  const planner = normalizePlanner({ monday: 'r1' })
  assert.deepEqual(planner.meals, ['r1'])
  assert.equal(planner.monday, 'r1')
  assert.equal(planner.sunday, null)
})

test('weekly meal pool is unique and assignment keeps the meal in the pool', () => {
  let planner = addMealToPlanner(normalizePlanner(), 'r1')
  planner = addMealToPlanner(planner, 'r1')
  assert.deepEqual(planner.meals, ['r1'])
  planner = assignMealToDay(planner, 'r1', 'wednesday')
  assert.equal(planner.wednesday, 'r1')
  planner = assignMealToDay(planner, 'r1', 'friday')
  assert.equal(planner.wednesday, null)
  assert.equal(planner.friday, 'r1')
  assert.deepEqual(planner.meals, ['r1'])
})

test('removing a weekly meal also clears any assigned day', () => {
  let planner = assignMealToDay(normalizePlanner(), 'r1', 'friday')
  planner = removeMealFromPlanner(planner, 'r1')
  assert.deepEqual(planner.meals, [])
  assert.equal(planner.friday, null)
})
