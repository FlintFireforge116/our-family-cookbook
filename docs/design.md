# Family Cookbook PWA — V1 Design

## Intent
Build a private, zero-cost, installable iPhone-first family recipe PWA that feels like opening a warm family cookbook rather than a database. Multiple devices should see the same shared library once Firebase is configured.

## Visual direction
- Warm cream background with muted sage, terracotta, peach, mustard, and dusty lilac accents.
- Rounded cards, gentle shadows, small botanical/kitchen doodle motifs.
- Arched handwritten “Let’s get cooking” title on the home screen.
- Proper vector/CSS UI rather than AI-generated artwork.
- Mobile-first and comfortable on iPhone Safari/PWA, responsive on larger screens.

## V1 screens
1. Home — routes to Recipes, Add Recipe, Categories & Tags, What Should We Cook?, My Week, Settings.
2. Recipes — photo cards, search, tag filtering, sort by name, newest, last cooked, and cooking time.
3. Add/Edit Recipe — title, description, photo, source link, notes, cooking time, tags.
4. Categories & Tags — user-created tags with recipe counts and quick filtering.
5. What Should We Cook? — random recipe suggestion, optionally narrowed by tags.
6. My Week — Monday–Sunday meal planner using recipes from the shared library.
7. Settings — cloud/local status, household display name, export/import backup, reset local demo data.

## Data model
Recipe: id, title, description, sourceUrl, notes, cookMinutes, tags[], imageData?, createdAt, updatedAt, lastCookedAt?.
Planner: ISO week key -> { monday..sunday: recipeId | null }.
Settings: householdName.

## Storage approach
- Repository abstraction used by UI.
- Local IndexedDB implementation works immediately with no credentials.
- Firebase Auth + Firestore implementation is available when Vite Firebase env vars are configured.
- V1 uses a single shared household Firebase email/password login across devices, matching the requested simple shared setup.
- To remain strictly zero-cost, recipe photos are compressed in-browser and stored as small WebP/JPEG data URLs in Firestore recipe documents. This is intentionally a private-family V1 tradeoff; migrate to object storage before any public release.
- Firestore offline persistence is enabled when cloud mode is used.

## PWA/offline
- Installable manifest and handwritten service worker; no build tooling or runtime framework is required.
- App shell cached for offline use.
- Local mode works entirely offline.
- Cloud mode relies on Firestore cache for previously loaded data and syncs when connectivity returns.

## Backup
JSON export/import contains recipes, planner, and settings, including compressed image data. The backup can be saved to iCloud Drive, GitHub manually, or another file store without giving the app access to GitHub credentials.

## Non-goals for V1
- Public accounts/registration, household invite codes, comments, social feed, ratings, grocery-list automation, nutrition parsing, recipe scraping, App Store packaging.

## Future-ready choices
The repository boundary allows a later move to multi-user household accounts and proper cloud object storage without rewriting the UI.
