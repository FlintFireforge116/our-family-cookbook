import { IndexedDbRepository } from './src/data/indexedDbRepository.js'
import { createFirebaseContext, hasFirebaseConfig } from './src/data/firebaseRepository.js'
import { createBackup, importBackup } from './src/data/backup.js'
import { allTags, filterRecipes, normalizeTags, sortRecipes } from './recipes-v032.js'
import { compressImage } from './src/domain/image.js'
import { addMealToPlanner, placeMealOnDay, moveMealBetweenDays, clearPlannerDay, removeMealFromPlanner, shiftWeek, weekDates, weekKeyForDate } from './week-v032.js'
import { esc, homeView, pageTop, recipeDetailView, recipeFormView, recipeListView, tagBrowserView, weekPlannerView, formatMinutes } from './views-v032.js'
import { icons } from './src/ui/icons.js'

const app = document.querySelector('#app')
const toastNode = document.querySelector('#toast')

const state = {
  recipes: [],
  settings: { householdName: 'Our Kitchen' },
  search: '',
  sort: 'newest',
  selectedTags: [],
  randomTags: [],
  randomId: null,
  tagSearch: '',
  tagUsage: 'all',
  weekDate: new Date(),
  calendarDate: new Date(),
  formRecipeId: null,
  formImageData: undefined,
}

let repository
let firebaseContext = null
let currentUser = null
let storageMode = 'local'

function toast(message) {
  toastNode.textContent = message
  toastNode.classList.add('show')
  clearTimeout(toastNode._timer)
  toastNode._timer = setTimeout(() => toastNode.classList.remove('show'), 2600)
}

function routeParts() {
  const raw = (location.hash || '#/').replace(/^#\/?/, '')
  return raw ? raw.split('/').map(decodeURIComponent) : []
}

async function refresh() {
  state.recipes = await repository.listRecipes()
  state.settings = await repository.getSettings()
  await render()
}

function bind(selector, event, handler) {
  document.querySelector(selector)?.addEventListener(event, handler)
}

function bindAll(selector, event, handler) {
  document.querySelectorAll(selector).forEach(node => node.addEventListener(event, handler))
}

function setPage(html, className = '', { preserveScroll = false } = {}) {
  const previousScroll = window.scrollY
  app.innerHTML = html
  app.className = className
  bind('[data-back]', 'click', () => {
    if (history.length > 1) history.back()
    else location.hash = '#/'
  })
  if (preserveScroll) requestAnimationFrame(() => window.scrollTo({ top: previousScroll, behavior: 'instant' }))
  else window.scrollTo({ top: 0, behavior: 'instant' })
}

function tagsList() {
  return allTags(state.recipes).map(item => item.name)
}

async function addRecipeToCurrentWeek(recipeId) {
  const key = weekKeyForDate(new Date())
  const planner = await repository.getPlanner(key)
  const alreadyThere = planner.meals?.includes(recipeId)
  if (!alreadyThere) await repository.savePlanner(key, addMealToPlanner(planner, recipeId))
  toast(alreadyThere ? 'Already in My Week' : 'Added to My Week')
}

function bindAddToWeekControls() {
  bindAll('[data-add-week]', 'click', async event => {
    event.preventDefault()
    event.stopPropagation()
    const recipeId = event.currentTarget.dataset.addWeek
    if (recipeId) await addRecipeToCurrentWeek(recipeId)
  })
}

async function saveWeekPlanner(key, planner, message = 'Week updated') {
  await repository.savePlanner(key, planner)
  toast(message)
  await render({ preserveScroll: true })
}

function randomView() {
  const tags = tagsList()
  const candidates = filterRecipes(state.recipes, '', state.randomTags)
  if (state.randomId && !candidates.some(recipe => recipe.id === state.randomId)) state.randomId = null
  if (!state.randomId && candidates.length) state.randomId = candidates[Math.floor(Math.random() * candidates.length)].id
  const recipe = candidates.find(item => item.id === state.randomId)
  return `${pageTop('What Should We Cook?','A little help when nobody wants to choose')}
    <main class="page narrow random-page">
      ${tags.length ? `<div class="random-filter"><p>Only pick from…</p><div class="chip-row">${tags.map(tag => `<button class="chip ${state.randomTags.includes(tag)?'active':''}" type="button" data-random-tag="${esc(tag)}">${esc(tag)}</button>`).join('')}</div></div>` : ''}
      ${recipe ? `<article class="random-card">
        <div class="random-photo">${recipe.imageData ? `<img src="${esc(recipe.imageData)}" alt="">` : `<div>${icons.recipes}</div>`}</div>
        <div class="random-copy"><span class="eyebrow">Tonight’s suggestion</span><h2>${esc(recipe.title)}</h2>${recipe.description?`<p>${esc(recipe.description)}</p>`:''}<span class="time-badge">${icons.clock}${formatMinutes(recipe.cookMinutes)}</span></div>
        <div class="random-actions"><a class="button primary" href="#/recipe/${encodeURIComponent(recipe.id)}">View recipe</a><button class="button week-button" type="button" data-add-week="${esc(recipe.id)}">${icons.week}<span>My Week</span></button><button id="pick-again" class="button secondary" type="button">Pick another</button></div>
      </article>` : `<section class="empty-state">${icons.random}<h2>Nothing to pick from yet</h2><p>${state.recipes.length ? 'No recipes match those tags. Try removing one.' : 'Add a few dishes and this button becomes your indecisive-evening hero.'}</p>${state.recipes.length?'':`<a class="button" href="#/recipe/new">Add a recipe</a>`}</section>`}
    </main>`
}

function settingsView() {
  return `${pageTop('Settings','Keep the cookbook safe and make it yours')}
    <main class="page narrow settings-page">
      <section class="settings-card">
        <h2>Our cookbook</h2>
        <form id="settings-form"><label><span>Kitchen name</span><input name="householdName" maxlength="60" value="${esc(state.settings.householdName || 'Our Kitchen')}"></label><button class="button primary" type="submit">Save name</button></form>
      </section>
      <section class="settings-card">
        <div class="setting-heading"><div><h2>Sync</h2><p>${storageMode === 'cloud' ? 'Shared between devices through Firebase.' : 'Currently stored only on this device.'}</p></div><span class="status-badge ${storageMode}">${storageMode === 'cloud' ? 'Cloud on' : 'Local'}</span></div>
        ${storageMode === 'cloud' ? `<p class="small-copy">Signed in as <strong>${esc(currentUser?.email || 'shared kitchen account')}</strong>.</p><button id="sign-out" class="button secondary" type="button">Sign out</button>` : `<p class="small-copy">This works fully offline. When you’re ready, add the free Firebase web config in <code>config.js</code> and the app will offer a shared login on every device.</p>`}
      </section>
      <section class="settings-card">
        <h2>Backup</h2><p>Export everything — recipes, photos, tags, notes and your weekly plans — as one file.</p>
        <div class="button-row"><button id="export-backup" class="button secondary" type="button">Export backup</button><label class="button secondary file-button">Import backup<input id="import-backup" type="file" accept="application/json,.json"></label></div>
      </section>
      <section class="settings-card subtle"><h2>About this version</h2><p>Private family V0.3.2 · installable PWA · no paid services required.</p></section>
    </main>`
}

function authView(error = '') {
  return `<main class="auth-screen">
    <div class="auth-card"><div class="auth-heart">♥</div><h1>Our Family Cookbook</h1><p>This cookbook is set up for shared sync. Sign into the shared kitchen account on each device.</p>
      ${error ? `<div class="error-box">${esc(error)}</div>` : ''}
      <form id="auth-form"><label><span>Email</span><input name="email" type="email" autocomplete="username" required></label><label><span>Password</span><input name="password" type="password" autocomplete="current-password" minlength="6" required></label><button class="button primary full" name="action" value="signin">Sign in</button><button class="button secondary full" name="action" value="signup">Create shared kitchen account</button></form>
      <small>Only create the account once. On other devices, use Sign in.</small></div>
  </main>`
}

async function render({ preserveScroll = false } = {}) {
  const [section, id, action] = routeParts()
  if (!section) {
    setPage(homeView(state.settings), 'home-mode')
    return
  }

  if (section === 'recipes') {
    const filtered = sortRecipes(filterRecipes(state.recipes, state.search, state.selectedTags), state.sort)
    setPage(recipeListView(filtered, { query:state.search, sort:state.sort, selectedTags:state.selectedTags, tags:tagsList() }), '', { preserveScroll })
    bind('#recipe-search','input', event => { state.search = event.target.value; render() })
    bind('#recipe-sort','change', event => { state.sort = event.target.value; render() })
    bindAll('[data-filter-tag]','click', event => {
      const tag = event.currentTarget.dataset.filterTag
      state.selectedTags = state.selectedTags.includes(tag) ? state.selectedTags.filter(value => value !== tag) : [...state.selectedTags, tag]
      render()
    })
    bindAddToWeekControls()
    return
  }

  if (section === 'recipe' && id === 'new') {
    renderRecipeForm(null)
    return
  }

  if (section === 'recipe' && id) {
    const recipe = await repository.getRecipe(id)
    if (action === 'edit') renderRecipeForm(recipe)
    else renderRecipeDetail(recipe)
    return
  }

  if (section === 'tags') {
    setPage(tagBrowserView(allTags(state.recipes), { query: state.tagSearch, usage: state.tagUsage }), '', { preserveScroll })
    bind('#tag-search','input', async event => {
      const cursor = event.currentTarget.selectionStart ?? event.currentTarget.value.length
      state.tagSearch = event.currentTarget.value
      await render({ preserveScroll: true })
      const input = document.querySelector('#tag-search')
      input?.focus()
      input?.setSelectionRange?.(cursor, cursor)
    })
    bind('#tag-usage','change', event => { state.tagUsage = event.currentTarget.value; render({ preserveScroll: true }) })
    bindAll('[data-open-tag]','click', event => { state.selectedTags = [event.currentTarget.dataset.openTag]; location.hash = '#/recipes' })
    return
  }

  if (section === 'random') {
    setPage(randomView(), '', { preserveScroll })
    bindAll('[data-random-tag]','click', event => {
      const tag = event.currentTarget.dataset.randomTag
      state.randomTags = state.randomTags.includes(tag) ? state.randomTags.filter(value => value !== tag) : [...state.randomTags, tag]
      state.randomId = null
      render()
    })
    bind('#pick-again','click', () => { state.randomId = null; render() })
    bindAddToWeekControls()
    return
  }

  if (section === 'week') {
    const key = weekKeyForDate(state.weekDate)
    const dates = weekDates(state.weekDate)
    const planner = await repository.getPlanner(key)
    setPage(weekPlannerView({ key, dates, planner, recipes: state.recipes, calendarDate: state.calendarDate }), '', { preserveScroll })
    bind('#prev-week','click', () => { state.weekDate = shiftWeek(state.weekDate,-1); state.calendarDate = new Date(state.weekDate); render() })
    bind('#next-week','click', () => { state.weekDate = shiftWeek(state.weekDate,1); state.calendarDate = new Date(state.weekDate); render() })
    bind('#this-week','click', () => { state.weekDate = new Date(); state.calendarDate = new Date(); render() })
    bindAll('[data-month-shift]','click', event => {
      const next = new Date(state.calendarDate)
      next.setDate(1)
      next.setMonth(next.getMonth() + Number(event.currentTarget.dataset.monthShift || 0))
      state.calendarDate = next
      render({ preserveScroll: true })
    })
    bindAll('[data-calendar-date]','click', event => {
      const [year,month,day] = event.currentTarget.dataset.calendarDate.split('-').map(Number)
      state.weekDate = new Date(year, month-1, day, 12)
      state.calendarDate = new Date(state.weekDate)
      render({ preserveScroll: true })
    })
    bind('#week-add-form','submit', async event => {
      event.preventDefault()
      const recipeId = document.querySelector('#week-add-recipe')?.value
      if (!recipeId) return
      await saveWeekPlanner(key, addMealToPlanner(planner, recipeId), 'Meal added to this week')
    })
    bindAll('[data-remove-week]','click', async event => {
      await saveWeekPlanner(key, removeMealFromPlanner(planner, event.currentTarget.dataset.removeWeek), 'Meal removed from this week')
    })
    bindAll('[data-toggle-meal-day]','click', async event => {
      const recipeId = event.currentTarget.dataset.toggleMealDay
      const day = event.currentTarget.dataset.day
      const next = planner[day] === recipeId ? clearPlannerDay(planner, day) : placeMealOnDay(planner, recipeId, day)
      await saveWeekPlanner(key, next, planner[day] === recipeId ? 'Meal removed from that day' : 'Meal added to that day')
    })
    bindAll('[data-clear-day]','click', async event => {
      event.preventDefault()
      event.stopPropagation()
      await saveWeekPlanner(key, clearPlannerDay(planner, event.currentTarget.dataset.clearDay), 'Day cleared')
    })
    bindAll('[data-drag-kind]','dragstart', event => {
      const source = event.currentTarget
      const payload = { kind: source.dataset.dragKind, recipeId: source.dataset.recipeId, day: source.dataset.dayMeal || null }
      event.dataTransfer?.setData('application/x-cookbook-meal', JSON.stringify(payload))
      event.dataTransfer?.setData('text/plain', payload.recipeId || '')
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setDragImage?.(source, Math.min(40, source.offsetWidth / 2), Math.min(28, source.offsetHeight / 2))
      }
      source.classList.add('dragging')
    })
    bindAll('[data-drag-kind]','dragend', event => event.currentTarget.classList.remove('dragging'))
    bindAll('[data-day-drop]','dragover', event => {
      event.preventDefault()
      event.currentTarget.classList.add('drag-over')
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    })
    bindAll('[data-day-drop]','dragleave', event => event.currentTarget.classList.remove('drag-over'))
    bindAll('[data-day-drop]','drop', async event => {
      event.preventDefault()
      event.currentTarget.classList.remove('drag-over')
      const targetDay = event.currentTarget.dataset.dayDrop
      let payload = null
      try { payload = JSON.parse(event.dataTransfer?.getData('application/x-cookbook-meal') || 'null') } catch {}
      const recipeId = payload?.recipeId || event.dataTransfer?.getData('text/plain')
      if (!recipeId || !targetDay) return
      const next = payload?.kind === 'day' && payload.day
        ? moveMealBetweenDays(planner, payload.day, targetDay)
        : placeMealOnDay(planner, recipeId, targetDay)
      await saveWeekPlanner(key, next, payload?.kind === 'day' ? 'Meal moved' : 'Meal added to that day')
    })
    bindAll('.drag-handle','pointerdown', event => {
      if (event.pointerType === 'mouse') return
      const source = event.currentTarget.closest('[data-drag-kind]')
      if (!source) return
      const payload = { kind: source.dataset.dragKind, recipeId: source.dataset.recipeId, day: source.dataset.dayMeal || null }
      const rect = source.getBoundingClientRect()
      const ghost = source.cloneNode(true)
      ghost.classList.add('drag-ghost')
      ghost.removeAttribute('draggable')
      ghost.style.width = `${Math.min(rect.width, 360)}px`
      ghost.style.left = `${Math.max(8, Math.min(window.innerWidth - Math.min(rect.width,360) - 8, event.clientX - Math.min(rect.width,360)/2))}px`
      ghost.style.top = `${Math.max(8, event.clientY - 28)}px`
      document.body.appendChild(ghost)
      document.body.classList.add('dragging-meal')
      source.classList.add('dragging')
      event.currentTarget.setPointerCapture?.(event.pointerId)
      let over = null
      const move = moveEvent => {
        moveEvent.preventDefault()
        ghost.style.left = `${Math.max(8, Math.min(window.innerWidth - ghost.offsetWidth - 8, moveEvent.clientX - ghost.offsetWidth/2))}px`
        ghost.style.top = `${Math.max(8, moveEvent.clientY - 28)}px`
        const hit = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest('[data-day-drop]')
        if (hit !== over) {
          over?.classList.remove('touch-drag-over')
          over = hit
          over?.classList.add('touch-drag-over')
        }
      }
      const finish = async upEvent => {
        event.currentTarget.releasePointerCapture?.(event.pointerId)
        event.currentTarget.removeEventListener('pointermove', move)
        event.currentTarget.removeEventListener('pointerup', finish)
        event.currentTarget.removeEventListener('pointercancel', cancel)
        over?.classList.remove('touch-drag-over')
        ghost.remove()
        document.body.classList.remove('dragging-meal')
        source.classList.remove('dragging')
        const targetDay = over?.dataset.dayDrop
        if (!targetDay) return
        const next = payload.kind === 'day' && payload.day
          ? moveMealBetweenDays(planner, payload.day, targetDay)
          : placeMealOnDay(planner, payload.recipeId, targetDay)
        await saveWeekPlanner(key, next, payload.kind === 'day' ? 'Meal moved' : 'Meal added to that day')
      }
      const cancel = () => {
        event.currentTarget.removeEventListener('pointermove', move)
        over?.classList.remove('touch-drag-over')
        ghost.remove()
        document.body.classList.remove('dragging-meal')
        source.classList.remove('dragging')
      }
      event.currentTarget.addEventListener('pointermove', move, { passive:false })
      event.currentTarget.addEventListener('pointerup', finish, { once:true })
      event.currentTarget.addEventListener('pointercancel', cancel, { once:true })
    })
    return
  }

  if (section === 'settings') {
    setPage(settingsView(), '', { preserveScroll })
    bindSettings()
    return
  }

  setPage(`${pageTop('Not found')}<main class="page"><section class="empty-state"><h2>That page wandered off</h2><a class="button" href="#/">Home</a></section></main>`)
}

function renderRecipeForm(recipe) {
  const formId = recipe?.id ?? 'new'
  if (state.formRecipeId !== formId) {
    state.formRecipeId = formId
    state.formImageData = recipe?.imageData ?? ''
  }
  setPage(recipeFormView(recipe, tagsList()))
  bind('#recipe-image','change', async event => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const preview = document.querySelector('#photo-preview')
      preview.innerHTML = '<strong>Preparing photo…</strong>'
      state.formImageData = await compressImage(file)
      preview.innerHTML = `<img src="${state.formImageData}" alt="Selected recipe">`
    } catch (error) {
      toast(error.message)
      event.target.value = ''
      renderRecipeForm(recipe)
    }
  })
  bindAll('[data-add-tag]','click', event => {
    const input = document.querySelector('input[name="tags"]')
    const tags = normalizeTags(input.value.split(',').concat(event.currentTarget.dataset.addTag))
    input.value = tags.join(', ')
  })
  bind('#recipe-form','submit', async event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const now = new Date().toISOString()
    const current = recipe ?? {}
    const title = String(form.get('title') ?? '').trim()
    if (!title) return toast('Give the dish a name first.')
    const saved = {
      id: current.id ?? crypto.randomUUID(),
      title,
      description: String(form.get('description') ?? '').trim(),
      cookMinutes: Math.max(1, (Number(form.get('cookHours')) || 0) * 60 + (Number(form.get('cookMinutesPart')) || 0)),
      tags: normalizeTags(String(form.get('tags') ?? '').split(',')),
      sourceUrl: String(form.get('sourceUrl') ?? '').trim(),
      notes: String(form.get('notes') ?? '').trim(),
      imageData: state.formImageData ?? current.imageData ?? '',
      createdAt: current.createdAt ?? now,
      updatedAt: now,
      lastCookedAt: current.lastCookedAt ?? null,
    }
    try {
      await repository.saveRecipe(saved)
      state.formRecipeId = null
      state.formImageData = undefined
      await refresh()
      location.hash = `#/recipe/${encodeURIComponent(saved.id)}`
      toast(recipe ? 'Recipe updated' : 'Recipe added')
    } catch (error) { toast(error.message || 'Could not save that recipe.') }
  })
}

function renderRecipeDetail(recipe) {
  setPage(recipeDetailView(recipe))
  if (!recipe) return
  bind('#cooked-today','click', async () => {
    await repository.saveRecipe({ ...recipe, lastCookedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    await refresh()
    toast('Marked as cooked today')
  })
  bindAddToWeekControls()
  bind('#delete-recipe','click', async () => {
    if (!confirm(`Delete “${recipe.title}”? This can’t be undone unless you have a backup.`)) return
    await repository.deleteRecipe(recipe.id)
    await refresh()
    location.hash = '#/recipes'
    toast('Recipe deleted')
  })
}

function bindSettings() {
  bind('#settings-form','submit', async event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await repository.saveSettings({ householdName: String(form.get('householdName') || 'Our Kitchen').trim() || 'Our Kitchen' })
    await refresh(); toast('Kitchen name saved')
  })
  bind('#export-backup','click', async () => {
    const text = await createBackup(repository)
    const blob = new Blob([text], { type:'application/json' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `family-cookbook-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(href)
    toast('Backup exported')
  })
  bind('#import-backup','change', async event => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      await importBackup(repository, text)
      await refresh()
      toast('Backup restored')
    } catch (error) { toast(error.message) }
  })
  bind('#sign-out','click', async () => { await firebaseContext?.signOut(); location.reload() })
}

function bindAuth() {
  bind('#auth-form','submit', async event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const action = event.submitter?.value
    try {
      if (action === 'signup') await firebaseContext.signUp(email,password)
      else await firebaseContext.signIn(email,password)
      location.reload()
    } catch (error) {
      setPage(authView(friendlyAuthError(error)))
      bindAuth()
    }
  })
}

function friendlyAuthError(error) {
  const code = error?.code ?? ''
  if (code.includes('invalid-credential')) return 'That email or password doesn’t match the shared kitchen account.'
  if (code.includes('email-already-in-use')) return 'That account already exists. Use Sign in instead.'
  if (code.includes('weak-password')) return 'Use a password with at least 6 characters.'
  return error?.message || 'Could not sign in.'
}

async function bootstrap() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  }

  const config = window.COOKBOOK_FIREBASE_CONFIG
  if (hasFirebaseConfig(config)) {
    try {
      firebaseContext = await createFirebaseContext(config)
      currentUser = await firebaseContext.waitForUser()
      if (!currentUser) {
        storageMode = 'cloud'
        setPage(authView())
        bindAuth()
        return
      }
      repository = firebaseContext.repositoryFor(currentUser.uid)
      storageMode = 'cloud'
    } catch (error) {
      console.error(error)
      repository = new IndexedDbRepository()
      storageMode = 'local'
      toast('Cloud sync is unavailable — using this device for now.')
    }
  } else {
    repository = new IndexedDbRepository()
  }

  window.addEventListener('hashchange', () => storageMode === 'cloud' ? refresh() : render())
  document.addEventListener('visibilitychange', () => { if (!document.hidden && storageMode === 'cloud') refresh() })
  await refresh()
  if (storageMode === 'cloud' && typeof repository.subscribeRecipes === 'function') {
    repository.subscribeRecipes(recipes => { state.recipes = recipes; render() })
  }
}

bootstrap().catch(error => {
  console.error(error)
  setPage(`<main class="auth-screen"><div class="auth-card"><h1>Couldn’t open the cookbook</h1><p>${esc(error.message)}</p><button class="button" onclick="location.reload()">Try again</button></div></main>`)
})
