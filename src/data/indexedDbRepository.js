const DB_NAME = 'family-cookbook-v1'
const VERSION = 1
const emptyPlanner = () => ({ monday:null,tuesday:null,wednesday:null,thursday:null,friday:null,saturday:null,sunday:null })

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('recipes')) db.createObjectStore('recipes', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('planners')) db.createObjectStore('planners', { keyPath: 'weekKey' })
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Could not open local cookbook storage.'))
  })
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Local storage operation failed.'))
  })
}

function transactionDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Local storage transaction failed.'))
    tx.onabort = () => reject(tx.error ?? new Error('Local storage transaction was cancelled.'))
  })
}

export class IndexedDbRepository {
  async db() { return openDatabase() }

  async listRecipes() {
    const db = await this.db()
    const tx = db.transaction('recipes', 'readonly')
    const values = await requestResult(tx.objectStore('recipes').getAll())
    db.close()
    return values
  }

  async getRecipe(id) {
    const db = await this.db()
    const tx = db.transaction('recipes', 'readonly')
    const value = await requestResult(tx.objectStore('recipes').get(id))
    db.close()
    return value ?? null
  }

  async saveRecipe(recipe) {
    const db = await this.db()
    const tx = db.transaction('recipes', 'readwrite')
    tx.objectStore('recipes').put(recipe)
    await transactionDone(tx)
    db.close()
    return recipe
  }

  async deleteRecipe(id) {
    const db = await this.db()
    const readTx = db.transaction('planners', 'readonly')
    const planners = await requestResult(readTx.objectStore('planners').getAll())
    const tx = db.transaction(['recipes','planners'], 'readwrite')
    tx.objectStore('recipes').delete(id)
    const store = tx.objectStore('planners')
    for (const item of planners) {
      const next = { ...item }
      let changed = false
      for (const day of Object.keys(emptyPlanner())) {
        if (next[day] === id) { next[day] = null; changed = true }
      }
      if (changed) store.put(next)
    }
    await transactionDone(tx)
    db.close()
  }

  async getPlanner(weekKey) {
    const db = await this.db()
    const tx = db.transaction('planners', 'readonly')
    const value = await requestResult(tx.objectStore('planners').get(weekKey))
    db.close()
    if (!value) return emptyPlanner()
    const { weekKey: _, ...planner } = value
    return { ...emptyPlanner(), ...planner }
  }

  async listPlanners() {
    const db = await this.db()
    const tx = db.transaction('planners', 'readonly')
    const values = await requestResult(tx.objectStore('planners').getAll())
    db.close()
    return Object.fromEntries(values.map(({ weekKey, ...planner }) => [weekKey, { ...emptyPlanner(), ...planner }]))
  }

  async savePlanner(weekKey, planner) {
    const value = { ...emptyPlanner(), ...planner }
    const db = await this.db()
    const tx = db.transaction('planners', 'readwrite')
    tx.objectStore('planners').put({ weekKey, ...value })
    await transactionDone(tx)
    db.close()
    return value
  }

  async getSettings() {
    const db = await this.db()
    const tx = db.transaction('settings', 'readonly')
    const value = await requestResult(tx.objectStore('settings').get('main'))
    db.close()
    return { householdName: 'Our Kitchen', ...(value ?? {}) }
  }

  async saveSettings(settings) {
    const current = await this.getSettings()
    const value = { ...current, ...settings, id: 'main' }
    const db = await this.db()
    const tx = db.transaction('settings', 'readwrite')
    tx.objectStore('settings').put(value)
    await transactionDone(tx)
    db.close()
    return value
  }

  async replaceAll(data) {
    const db = await this.db()
    const tx = db.transaction(['recipes','planners','settings'], 'readwrite')
    const recipes = tx.objectStore('recipes')
    const planners = tx.objectStore('planners')
    const settings = tx.objectStore('settings')
    recipes.clear(); planners.clear(); settings.clear()
    for (const recipe of data.recipes) recipes.put(recipe)
    for (const [weekKey, planner] of Object.entries(data.planners)) planners.put({ weekKey, ...planner })
    settings.put({ id: 'main', ...data.settings })
    await transactionDone(tx)
    db.close()
  }
}
