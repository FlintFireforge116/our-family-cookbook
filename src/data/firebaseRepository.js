import { normalizePlanner, removeMealFromPlanner } from '../domain/week.js'

export function hasFirebaseConfig(config) {
  return Boolean(config?.apiKey && config?.authDomain && config?.projectId && config?.appId)
}

const FIREBASE_VERSION = '12.4.0'
const url = module => `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-${module}.js`

async function firebaseModules() {
  const [app, auth, firestore] = await Promise.all([
    import(url('app')),
    import(url('auth')),
    import(url('firestore')),
  ])
  return { ...app, ...auth, ...firestore }
}

export async function createFirebaseContext(config) {
  if (!hasFirebaseConfig(config)) throw new Error('Firebase is not configured.')
  const fb = await firebaseModules()
  const app = fb.initializeApp(config)
  const auth = fb.getAuth(app)
  const db = fb.initializeFirestore(app, {
    localCache: fb.persistentLocalCache({ tabManager: fb.persistentMultipleTabManager() }),
  })

  const waitForUser = () => new Promise(resolve => {
    const stop = fb.onAuthStateChanged(auth, user => { stop(); resolve(user) })
  })

  return {
    auth,
    waitForUser,
    signIn: (email, password) => fb.signInWithEmailAndPassword(auth, email, password),
    signUp: (email, password) => fb.createUserWithEmailAndPassword(auth, email, password),
    signOut: () => fb.signOut(auth),
    repositoryFor(uid) { return new FirebaseRepository(db, fb, uid) },
  }
}

class FirebaseRepository {
  constructor(db, fb, uid) {
    this.db = db
    this.fb = fb
    this.uid = uid
  }

  recipesCollection() { return this.fb.collection(this.db, 'users', this.uid, 'recipes') }
  recipeDoc(id) { return this.fb.doc(this.db, 'users', this.uid, 'recipes', id) }
  plannerDoc(key) { return this.fb.doc(this.db, 'users', this.uid, 'planners', key) }
  settingsDoc() { return this.fb.doc(this.db, 'users', this.uid, 'meta', 'settings') }

  async listRecipes() {
    const snap = await this.fb.getDocs(this.recipesCollection())
    return snap.docs.map(d => d.data())
  }
  subscribeRecipes(callback) {
    return this.fb.onSnapshot(this.recipesCollection(), snap => callback(snap.docs.map(d => d.data())))
  }
  async getRecipe(id) {
    const snap = await this.fb.getDoc(this.recipeDoc(id))
    return snap.exists() ? snap.data() : null
  }
  async saveRecipe(recipe) {
    await this.fb.setDoc(this.recipeDoc(recipe.id), recipe)
    return recipe
  }
  async deleteRecipe(id) {
    await this.fb.deleteDoc(this.recipeDoc(id))
    const planners = await this.listPlanners()
    for (const [key, planner] of Object.entries(planners)) {
      const next = removeMealFromPlanner(planner, id)
      if (JSON.stringify(next) !== JSON.stringify(normalizePlanner(planner))) await this.savePlanner(key, next)
    }
  }
  async getPlanner(key) {
    const snap = await this.fb.getDoc(this.plannerDoc(key))
    return snap.exists() ? normalizePlanner(snap.data()) : normalizePlanner()
  }
  async listPlanners() {
    const snap = await this.fb.getDocs(this.fb.collection(this.db, 'users', this.uid, 'planners'))
    return Object.fromEntries(snap.docs.map(d => [d.id, normalizePlanner(d.data())]))
  }
  async savePlanner(key, planner) {
    const value = normalizePlanner(planner)
    await this.fb.setDoc(this.plannerDoc(key), value)
    return value
  }
  async getSettings() {
    const snap = await this.fb.getDoc(this.settingsDoc())
    return snap.exists() ? { householdName: 'Our Kitchen', ...snap.data() } : { householdName: 'Our Kitchen' }
  }
  async saveSettings(settings) {
    await this.fb.setDoc(this.settingsDoc(), settings, { merge: true })
    return this.getSettings()
  }
  async replaceAll(data) {
    const existing = await this.listRecipes()
    for (const recipe of existing) await this.fb.deleteDoc(this.recipeDoc(recipe.id))
    const oldPlanners = await this.listPlanners()
    for (const key of Object.keys(oldPlanners)) await this.fb.deleteDoc(this.plannerDoc(key))
    for (const recipe of data.recipes) await this.saveRecipe(recipe)
    for (const [key, planner] of Object.entries(data.planners)) await this.savePlanner(key, planner)
    await this.fb.setDoc(this.settingsDoc(), data.settings)
  }
}
