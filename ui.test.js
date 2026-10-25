import test from 'node:test'
import assert from 'node:assert/strict'
import { homeView, pageTop, recipeDetailView, recipeFormView, recipeListView, tagBrowserView, weekPlannerView } from '../src/ui/views.js'

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


test('page header exposes both back and home navigation controls', () => {
  const html = pageTop('Recipes')
  assert.match(html, /data-back/)
  assert.match(html, /aria-label="Home"/)
})

test('recipe form uses separate hours and minutes selectors', () => {
  const html = recipeFormView({ id:'r1', title:'Ragu', description:'', sourceUrl:'', notes:'', tags:[], cookMinutes:95, imageData:'' }, [])
  assert.match(html, /name="cookHours"/)
  assert.match(html, /name="cookMinutesPart"/)
  assert.match(html, /value="1" selected/)
  assert.match(html, /value="35" selected/)
})

test('tag browser provides search and usage filtering', () => {
  const html = tagBrowserView([{name:'Batch cook',count:3},{name:'Beef',count:1}], { query:'ba', usage:'multi' })
  assert.match(html, /id="tag-search"/)
  assert.match(html, /id="tag-usage"/)
  assert.match(html, /Batch cook/)
  assert.doesNotMatch(html, />Beef</)
})

test('weekly planner includes a month calendar and multi-day meal controls', () => {
  const recipes = [{ id:'r1', title:'Batch chilli', cookMinutes:120, imageData:'' }]
  const dates = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((day,index)=>({day,date:new Date(2026,9,26+index,12)}))
  const html = weekPlannerView({ key:'2026-W44', dates, planner:{meals:['r1'],monday:'r1',tuesday:null,wednesday:'r1',thursday:null,friday:null,saturday:null,sunday:null}, recipes, calendarDate:new Date(2026,9,26,12) })
  assert.match(html, /month-calendar/)
  assert.match(html, /data-calendar-date=/)
  assert.match(html, /data-toggle-meal-day="r1"/)
  assert.match(html, /data-day-meal="monday"/)
  assert.match(html, /data-day-meal="wednesday"/)
})
