import { heroStillLife, icons } from './icons.js'

export const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')

export function formatMinutes(value) {
  const minutes = Number(value) || 0
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}

function navCard(href, tone, icon, title, subtitle) {
  return `<a class="home-card tone-${tone}" href="${href}">
    <span class="home-card-icon">${icons[icon]}</span>
    <span class="home-card-copy"><strong>${title}</strong><small>${subtitle}</small></span>
    <span class="chevron">›</span>
  </a>`
}

export function homeView(settings = {}) {
  return `<main class="home-screen">
    <section class="home-hero">
      <svg class="arched-title" viewBox="0 0 360 104" role="img" aria-label="Let's get cooking">
        <defs><path id="title-arc" d="M35 86 Q180 -5 325 86"/></defs>
        <text><textPath href="#title-arc" startOffset="50%" text-anchor="middle">Let's get cooking</textPath></text>
      </svg>
      <div class="tiny-heart" aria-hidden="true">♥</div>
      <p class="hero-subtitle">Welcome to <span>${esc(settings.householdName || 'our family kitchen')}</span></p>
      ${heroStillLife()}
    </section>
    <section class="home-nav" aria-label="Cookbook sections">
      ${navCard('#/recipes','sage','recipes','Recipes','Browse the family recipe book')}
      ${navCard('#/recipe/new','peach','add','Add Recipe','Save a new family favourite')}
      ${navCard('#/tags','mustard','tags','Categories & Tags','Find dishes your way')}
      ${navCard('#/random','green','random','What Should We Cook?','Let the recipe book decide')}
      ${navCard('#/week','lilac','week','My Week','Plan meals for the week')}
    </section>
    <a class="settings-pill" href="#/settings">${icons.settings}<span>Settings</span></a>
  </main>`
}

export function pageTop(title, subtitle = '') {
  return `<header class="page-top">
    <a class="icon-button" href="#/" aria-label="Home">${icons.home}</a>
    <div><h1>${esc(title)}</h1>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>
    <span class="page-top-spacer"></span>
  </header>`
}

function recipePhoto(recipe) {
  if (recipe.imageData) return `<img src="${esc(recipe.imageData)}" alt="" loading="lazy">`
  return `<div class="recipe-photo-placeholder">${icons.recipes}</div>`
}

export function recipeListView(recipes, filters) {
  const { query = '', sort = 'newest', selectedTags = [], tags = [] } = filters
  const chips = tags.map(tag => {
    const active = selectedTags.some(value => value.toLocaleLowerCase() === tag.toLocaleLowerCase())
    return `<button class="chip ${active ? 'active' : ''}" data-filter-tag="${esc(tag)}" type="button">${esc(tag)}</button>`
  }).join('')
  const cards = recipes.map(recipe => `<a class="recipe-card" href="#/recipe/${encodeURIComponent(recipe.id)}">
    <div class="recipe-card-photo">${recipePhoto(recipe)}</div>
    <div class="recipe-card-body">
      <div class="recipe-card-heading"><h2>${esc(recipe.title)}</h2><span class="time-badge">${icons.clock}${formatMinutes(recipe.cookMinutes)}</span></div>
      ${recipe.description ? `<p>${esc(recipe.description)}</p>` : ''}
      <div class="mini-tags">${(recipe.tags ?? []).slice(0,4).map(tag => `<span>${esc(tag)}</span>`).join('')}</div>
    </div>
  </a>`).join('')

  return `${pageTop('Recipes','Everything we know how to make')}
    <main class="page recipes-page">
      <div class="recipe-toolbar">
        <label class="search-box"><span>Search</span><input id="recipe-search" type="search" value="${esc(query)}" placeholder="Pasta, beef, freezer…"></label>
        <label class="sort-box"><span>Sort</span><select id="recipe-sort">
          <option value="newest" ${sort==='newest'?'selected':''}>Newest</option>
          <option value="name" ${sort==='name'?'selected':''}>A–Z</option>
          <option value="lastCooked" ${sort==='lastCooked'?'selected':''}>Last cooked</option>
          <option value="time" ${sort==='time'?'selected':''}>Quickest</option>
        </select></label>
      </div>
      ${chips ? `<div class="chip-row" aria-label="Filter by tag">${chips}</div>` : ''}
      <div class="section-heading"><span>${recipes.length} ${recipes.length===1?'recipe':'recipes'}</span><a class="button small" href="#/recipe/new">＋ Add</a></div>
      <div class="recipe-grid">${cards || `<section class="empty-state">${icons.book}<h2>Your recipe book is waiting</h2><p>Add your first recipe, then you’ll be able to search, tag and plan it here.</p><a class="button" href="#/recipe/new">Add your first recipe</a></section>`}</div>
    </main>`
}

export function recipeFormView(recipe = null, tags = []) {
  const editing = Boolean(recipe)
  const value = recipe ?? { title:'', description:'', sourceUrl:'', notes:'', cookMinutes:'', tags:[], imageData:'' }
  return `${pageTop(editing ? 'Edit Recipe' : 'Add Recipe', editing ? 'Change anything you need' : 'Add something worth making again')}
    <main class="page narrow">
      <form id="recipe-form" class="paper-form" data-recipe-id="${esc(recipe?.id ?? '')}">
        <label class="photo-picker">
          <input id="recipe-image" type="file" accept="image/*">
          <span id="photo-preview" class="photo-preview">${value.imageData ? `<img src="${esc(value.imageData)}" alt="Current recipe">` : `${icons.camera}<strong>Add a photo</strong><small>Optional · compressed on your phone</small>`}</span>
        </label>
        <label><span>Dish name *</span><input name="title" required maxlength="100" value="${esc(value.title)}" placeholder="e.g. Beef ragu"></label>
        <label><span>Short description</span><input name="description" maxlength="180" value="${esc(value.description)}" placeholder="Slow-cooked Sunday favourite"></label>
        <label><span>How long does it take?</span><div class="input-suffix"><input name="cookMinutes" type="number" min="1" max="1440" inputmode="numeric" value="${esc(value.cookMinutes)}"><span>minutes</span></div></label>
        <label><span>Tags</span><input name="tags" value="${esc((value.tags ?? []).join(', '))}" placeholder="Pasta, Batch cook, Beef"><small>Separate tags with commas. Create whatever categories make sense to you.</small></label>
        ${tags.length ? `<div class="suggestion-row"><span>Used before:</span>${tags.slice(0,10).map(tag => `<button type="button" class="text-chip" data-add-tag="${esc(tag)}">${esc(tag)}</button>`).join('')}</div>` : ''}
        <label><span>Recipe link</span><input name="sourceUrl" type="url" value="${esc(value.sourceUrl)}" placeholder="https://…"></label>
        <label><span>Notes</span><textarea name="notes" rows="6" placeholder="Anything you change, serving ideas, what worked…">${esc(value.notes)}</textarea></label>
        <button class="button primary full" type="submit">${editing ? 'Save Changes' : 'Add to Recipe Book'}</button>
      </form>
    </main>`
}

export function recipeDetailView(recipe) {
  if (!recipe) return `${pageTop('Recipe')}<main class="page"><section class="empty-state"><h2>Recipe not found</h2><a class="button" href="#/recipes">Back to recipes</a></section></main>`
  const source = safeHttpUrl(recipe.sourceUrl)
  return `${pageTop(recipe.title)}<main class="page narrow">
    <article class="recipe-detail">
      <div class="detail-photo">${recipePhoto(recipe)}</div>
      <div class="detail-meta"><span>${icons.clock}${formatMinutes(recipe.cookMinutes)}</span>${recipe.lastCookedAt ? `<span>Last cooked ${formatDate(recipe.lastCookedAt)}</span>` : '<span>Not cooked yet</span>'}</div>
      ${recipe.description ? `<p class="detail-description">${esc(recipe.description)}</p>` : ''}
      <div class="mini-tags large">${(recipe.tags??[]).map(tag => `<span>${esc(tag)}</span>`).join('')}</div>
      ${recipe.notes ? `<section class="note-card"><h2>Notes</h2><p>${esc(recipe.notes).replaceAll('\n','<br>')}</p></section>` : ''}
      ${source ? `<a class="source-link button secondary full" href="${esc(source)}" target="_blank" rel="noopener">Open original recipe ↗</a>` : ''}
      <div class="detail-actions"><button id="cooked-today" class="button primary" type="button">✓ Cooked today</button><a class="button secondary" href="#/recipe/${encodeURIComponent(recipe.id)}/edit">Edit</a></div>
      <button id="delete-recipe" class="danger-link" type="button">Delete recipe</button>
    </article>
  </main>`
}

export function safeHttpUrl(value) {
  try {
    const url = new URL(value)
    return ['http:','https:'].includes(url.protocol) ? url.href : ''
  } catch { return '' }
}

export function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat(undefined, { day:'numeric', month:'short', year:'numeric' }).format(new Date(value))
}
