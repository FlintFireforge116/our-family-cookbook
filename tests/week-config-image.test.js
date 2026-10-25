import test from 'node:test'
import assert from 'node:assert/strict'
import { weekKeyForDate, weekDates } from '../src/domain/week.js'
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
