import test from 'node:test'
import assert from 'node:assert/strict'
import { homeView, recipeDetailView, recipeListView, weekPlannerView } from '../src/ui/views.js'

test('home view exposes the agreed cookbook destinations', () => {
  const html = homeView({ householdName: 'Our Kitchen' })
  assert.match(html, /Let.+get cooking/i)
  assert.match(html, /viewBox="0 0 440 120"/)
  assert.match(html, /textLength="350"/)
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


test('recipe browsing and detail views can add a recipe to My Week', () => {
  const recipe = { id:'r1', title:'Beef ragu', description:'', notes:'', sourceUrl:'', tags:['Pasta'], cookMinutes:90, imageData:'', createdAt:'2026-01-01', updatedAt:'2026-01-01', lastCookedAt:null }
  const listHtml = recipeListView([recipe], { query:'', sort:'newest', selectedTags:[], tags:['Pasta'] })
  const detailHtml = recipeDetailView(recipe)
  assert.match(listHtml, /data-add-week="r1"/)
  assert.match(detailHtml, /data-add-week="r1"/)
})

test('weekly planner renders a meal pool and seven assignable day slots', () => {
  const recipes = [
    { id:'r1', title:'Beef ragu', cookMinutes:90, imageData:'' },
    { id:'r2', title:'Tacos', cookMinutes:30, imageData:'' },
  ]
  const dates = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((day, index) => ({ day, date:new Date(2026,9,26+index,12) }))
  const html = weekPlannerView({ key:'2026-W44', dates, planner:{ meals:['r1','r2'], monday:'r1', tuesday:null, wednesday:null, thursday:null, friday:null, saturday:null, sunday:null }, recipes })
  assert.match(html, /Meals this week/)
  assert.match(html, /data-week-meal="r1"/)
  assert.equal((html.match(/data-day-drop=/g) ?? []).length, 7)
  assert.match(html, /Beef ragu/)
})
