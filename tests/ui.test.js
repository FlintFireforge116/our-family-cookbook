import test from 'node:test'
import assert from 'node:assert/strict'
import { homeView, recipeListView } from '../src/ui/views.js'

test('home view exposes the agreed cookbook destinations', () => {
  const html = homeView({ householdName: 'Our Kitchen' })
  assert.match(html, /Let.+get cooking/i)
  for (const label of ['Recipes', 'Add Recipe', 'Categories & Tags', 'What Should We Cook?', 'My Week']) {
    assert.match(html, new RegExp(label.replace(/[?]/g, '\\?')))
  }
})

test('recipe list has a friendly empty state', () => {
  const html = recipeListView([], { query: '', sort: 'newest', selectedTags: [], tags: [] })
  assert.match(html, /Your recipe book is waiting/i)
  assert.match(html, /Add your first recipe/i)
})

test('recipe list renders recipe title and cooking time', () => {
  const html = recipeListView([{ id:'r1', title:'Beef ragu', description:'', notes:'', sourceUrl:'', tags:['Pasta'], cookMinutes:90, imageData:'', createdAt:'2026-01-01', updatedAt:'2026-01-01', lastCookedAt:null }], { query:'', sort:'newest', selectedTags:[], tags:['Pasta'] })
  assert.match(html, /Beef ragu/)
  assert.match(html, /1 hr 30 min/)
})
