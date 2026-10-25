import test from 'node:test'
import assert from 'node:assert/strict'
import { MemoryRepository } from '../src/data/memoryRepository.js'
import { createBackup, parseBackup } from '../src/data/backup.js'

const recipe = (id = 'r1') => ({
  id,
  title: 'Beef ragu',
  description: 'Slow cooked',
  sourceUrl: '',
  notes: '',
  cookMinutes: 90,
  tags: ['Pasta'],
  imageData: '',
  createdAt: '2026-10-25T08:00:00.000Z',
  updatedAt: '2026-10-25T08:00:00.000Z',
  lastCookedAt: null,
})

test('repository creates, updates and lists recipes', async () => {
  const repo = new MemoryRepository()
  await repo.saveRecipe(recipe())
  await repo.saveRecipe({ ...recipe(), title: 'Ragu' })
  assert.equal((await repo.listRecipes()).length, 1)
  assert.equal((await repo.getRecipe('r1')).title, 'Ragu')
})

test('deleting a recipe clears planner references', async () => {
  const repo = new MemoryRepository()
  await repo.saveRecipe(recipe())
  await repo.savePlanner('2026-W43', { monday: 'r1', tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null })
  await repo.deleteRecipe('r1')
  assert.equal((await repo.getPlanner('2026-W43')).monday, null)
})

test('backup round-trips recipes, planners and settings', async () => {
  const repo = new MemoryRepository()
  await repo.saveRecipe(recipe())
  await repo.savePlanner('2026-W43', { monday: 'r1', tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null })
  await repo.saveSettings({ householdName: 'Our Kitchen' })
  const text = await createBackup(repo)
  const parsed = parseBackup(text)
  assert.equal(parsed.recipes[0].title, 'Beef ragu')
  assert.equal(parsed.planners['2026-W43'].monday, 'r1')
  assert.equal(parsed.settings.householdName, 'Our Kitchen')
})

test('invalid backup data is rejected', () => {
  assert.throws(() => parseBackup('{"hello":"world"}'), /backup/i)
  assert.throws(() => parseBackup('not json'), /backup/i)
})
