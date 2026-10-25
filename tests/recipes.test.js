import test from 'node:test'
import assert from 'node:assert/strict'
import { filterRecipes, normalizeTags, sortRecipes } from '../src/domain/recipes.js'

const base = (overrides = {}) => ({
  id: Math.random().toString(36).slice(2),
  title: 'Recipe',
  description: '',
  sourceUrl: '',
  notes: '',
  cookMinutes: 30,
  tags: [],
  imageData: '',
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
  lastCookedAt: null,
  ...overrides,
})

test('normalizeTags trims, deduplicates case-insensitively, and keeps friendly casing', () => {
  assert.deepEqual(normalizeTags([' Pasta ', 'beef', 'PASTA', '', ' Batch cook ']), ['Pasta', 'Beef', 'Batch cook'])
})

test('filterRecipes matches title, notes, and tags case-insensitively', () => {
  const recipes = [
    base({ title: 'Beef ragu', tags: ['Pasta', 'Batch cook'], notes: 'freezer friendly' }),
    base({ title: 'Chicken curry', tags: ['Curry'], notes: 'mild' }),
  ]
  assert.equal(filterRecipes(recipes, 'freezer', []).length, 1)
  assert.equal(filterRecipes(recipes, 'PASTA', []).length, 1)
  assert.equal(filterRecipes(recipes, 'chicken', []).length, 1)
})

test('filterRecipes requires every selected tag', () => {
  const recipes = [
    base({ title: 'Beef ragu', tags: ['Pasta', 'Batch cook'] }),
    base({ title: 'Chicken curry', tags: ['Curry'] }),
  ]
  assert.equal(filterRecipes(recipes, '', ['Pasta', 'Batch cook']).length, 1)
  assert.equal(filterRecipes(recipes, '', ['Pasta', 'Curry']).length, 0)
})

test('sortRecipes supports name, newest, time, and last cooked', () => {
  const recipes = [
    base({ id: 'b', title: 'Ziti', cookMinutes: 20, createdAt: '2026-10-02T00:00:00.000Z', lastCookedAt: null }),
    base({ id: 'a', title: 'Apple pie', cookMinutes: 90, createdAt: '2026-10-03T00:00:00.000Z', lastCookedAt: '2026-10-24T00:00:00.000Z' }),
  ]
  assert.deepEqual(sortRecipes(recipes, 'name').map(r => r.id), ['a', 'b'])
  assert.deepEqual(sortRecipes(recipes, 'newest').map(r => r.id), ['a', 'b'])
  assert.deepEqual(sortRecipes(recipes, 'time').map(r => r.id), ['b', 'a'])
  assert.deepEqual(sortRecipes(recipes, 'lastCooked').map(r => r.id), ['a', 'b'])
})
