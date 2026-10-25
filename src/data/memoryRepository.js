const emptyPlanner = () => ({
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null,
})

export class MemoryRepository {
  constructor(seed = {}) {
    this.recipes = new Map((seed.recipes ?? []).map(recipe => [recipe.id, structuredClone(recipe)]))
    this.planners = new Map(Object.entries(seed.planners ?? {}).map(([key, value]) => [key, structuredClone(value)]))
    this.settings = { householdName: 'Our Kitchen', ...(seed.settings ?? {}) }
  }

  async listRecipes() {
    return [...this.recipes.values()].map(value => structuredClone(value))
  }

  async getRecipe(id) {
    const recipe = this.recipes.get(id)
    return recipe ? structuredClone(recipe) : null
  }

  async saveRecipe(recipe) {
    this.recipes.set(recipe.id, structuredClone(recipe))
    return structuredClone(recipe)
  }

  async deleteRecipe(id) {
    this.recipes.delete(id)
    for (const [key, planner] of this.planners.entries()) {
      const next = { ...planner }
      for (const day of Object.keys(next)) {
        if (next[day] === id) next[day] = null
      }
      this.planners.set(key, next)
    }
  }

  async getPlanner(weekKey) {
    return structuredClone(this.planners.get(weekKey) ?? emptyPlanner())
  }

  async listPlanners() {
    return Object.fromEntries([...this.planners.entries()].map(([key, value]) => [key, structuredClone(value)]))
  }

  async savePlanner(weekKey, planner) {
    const merged = { ...emptyPlanner(), ...planner }
    this.planners.set(weekKey, structuredClone(merged))
    return structuredClone(merged)
  }

  async getSettings() {
    return structuredClone(this.settings)
  }

  async saveSettings(settings) {
    this.settings = { ...this.settings, ...structuredClone(settings) }
    return structuredClone(this.settings)
  }

  async replaceAll(data) {
    this.recipes = new Map((data.recipes ?? []).map(recipe => [recipe.id, structuredClone(recipe)]))
    this.planners = new Map(Object.entries(data.planners ?? {}).map(([key, value]) => [key, structuredClone(value)]))
    this.settings = { householdName: 'Our Kitchen', ...(data.settings ?? {}) }
  }
}
