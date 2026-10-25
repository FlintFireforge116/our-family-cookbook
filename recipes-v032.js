export function normalizeTags(tags) {
  const seen = new Set()
  const result = []
  for (const raw of tags ?? []) {
    const trimmed = String(raw).trim().replace(/\s+/g, ' ')
    if (!trimmed) continue
    const key = trimmed.toLocaleLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed.charAt(0).toLocaleUpperCase() + trimmed.slice(1))
  }
  return result
}

export function filterRecipes(recipes, query = '', selectedTags = []) {
  const q = query.trim().toLocaleLowerCase()
  const wanted = selectedTags.map(tag => tag.toLocaleLowerCase())
  return recipes.filter(recipe => {
    const haystack = [recipe.title, recipe.description, recipe.notes, ...(recipe.tags ?? [])]
      .join(' ')
      .toLocaleLowerCase()
    const matchesQuery = !q || haystack.includes(q)
    const recipeTags = new Set((recipe.tags ?? []).map(tag => tag.toLocaleLowerCase()))
    const matchesTags = wanted.every(tag => recipeTags.has(tag))
    return matchesQuery && matchesTags
  })
}

export function sortRecipes(recipes, mode = 'newest') {
  const copy = [...recipes]
  const dateValue = value => value ? new Date(value).getTime() : -Infinity
  switch (mode) {
    case 'name':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'time':
      return copy.sort((a, b) => (Number(a.cookMinutes) || Infinity) - (Number(b.cookMinutes) || Infinity))
    case 'lastCooked':
      return copy.sort((a, b) => dateValue(b.lastCookedAt) - dateValue(a.lastCookedAt))
    case 'newest':
    default:
      return copy.sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt))
  }
}

export function allTags(recipes) {
  const map = new Map()
  for (const recipe of recipes) {
    for (const tag of normalizeTags(recipe.tags ?? [])) {
      const key = tag.toLocaleLowerCase()
      const current = map.get(key) ?? { name: tag, count: 0 }
      current.count += 1
      map.set(key, current)
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
}


export function filterTags(tags, query = '', usage = 'all') {
  const q = String(query ?? '').trim().toLocaleLowerCase()
  return (tags ?? []).filter(tag => {
    const matchesQuery = !q || String(tag.name ?? '').toLocaleLowerCase().includes(q)
    const count = Number(tag.count) || 0
    const matchesUsage = usage === 'single' ? count === 1 : usage === 'multi' ? count >= 2 : true
    return matchesQuery && matchesUsage
  })
}
