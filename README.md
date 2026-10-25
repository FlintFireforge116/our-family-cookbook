# Our Family Cookbook

A private, installable family recipe PWA designed for iPhone first. It works locally with no accounts or paid services, and can optionally use Firebase Authentication + Firestore to sync the same cookbook between devices.

## What V0.3 includes

- Warm cookbook-style home screen with **Recipes**, **Add Recipe**, **Categories & Tags**, **What Should We Cook?**, and **My Week**.
- User-created multi-tags such as `Pasta`, `Batch cook`, `Beef`, etc.
- Search by dish name, notes or tags.
- Sort by newest, A–Z, last cooked or quickest.
- Photos from the phone camera/photo library, compressed before saving.
- Recipe links, notes, cooking time and last-cooked tracking.
- Random recipe chooser with optional tag filters.
- Monday–Sunday meal planner.
- Full JSON backup/import, including compressed photos and plans.
- Installable/offline PWA.
- Optional shared sync with a single household Firebase login.

## Run it locally

No dependency install or build step is required.

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

Tests use Node's built-in test runner:

```bash
npm test
```

## Free local-only setup

Do nothing to `config.js`. The app uses IndexedDB on that device and works offline. Use **Settings → Export backup** periodically.

## Free shared sync setup (Firebase)

This version deliberately does **not** use Firebase Storage, so no Blaze/billing account is needed. Recipe photos are compressed aggressively and stored with the recipe data in Firestore. That is suitable for a small private family cookbook; migrate photos to proper object storage before any public release.

1. Create a Firebase project on the Spark/free plan. Analytics is optional and unnecessary here.
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. Create a **Cloud Firestore** database.
4. In Firestore's **Rules** tab, replace the rules with the contents of `firestore.rules` and publish them.
5. In **Project settings → Your apps**, add a Web app and copy its Firebase configuration.
6. Paste that object into `config.js` as `window.COOKBOOK_FIREBASE_CONFIG`.
7. Deploy/reload the app. It will show a shared-kitchen sign-in screen.
8. On the first device choose **Create shared kitchen account**. On every other device choose **Sign in** with the same email/password.

Firebase's web configuration is not treated as a secret; the Firestore rules restrict the cookbook to the signed-in UID. Never put the shared account password into `config.js` or GitHub.

### Moving from local-only to cloud sync

Before switching `config.js` to Firebase, export a backup from **Settings**. After signing into the cloud version, import that backup. This makes the transition explicit and prevents accidental duplication.

## Deploy free with GitHub Pages

1. Put the project files on the repository's `main` branch with `index.html` at the repository root.
2. On GitHub open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and `/(root)`, then save.
5. Open the generated Pages URL in Safari on the iPhone.
6. Tap **Share → Add to Home Screen**, make sure **Open as Web App** is enabled, then add it.

The GitHub repository contains only app code/configuration. Recipes and photos are stored in the browser (local mode) or Firestore (cloud mode), not committed to GitHub.

## Security / public-release note

The current single-login model is intentionally simple for a private household. Before making this public, replace it with separate user accounts + household membership/invites, move photos to proper object storage, add App Check/rate controls, and review the Firestore rules and privacy model.


## V0.2 planner update
- My Week now has a weekly meal pool plus weekday slots.
- Add recipes to the current week from recipe cards, recipe detail, or the random picker.
- Assign a meal with drag-and-drop on larger screens or the Day menu on touch devices.
- The home title has been rebalanced so it stays inside its arch.


## V0.3 usability update

- Added Back + Home navigation controls and corrected icon centring.
- Added a full month calendar to My Week; tap any date to open that week.
- Batch meals can be assigned to multiple days.
- Dragging from the meal pool adds a meal to a day; dragging an assigned day card moves that serving to another day.
- Touch dragging uses a full-card drag ghost and preserves the current scroll position.
- Recipe duration now uses Hours and Minutes selectors.
- Recipe Sort styling now matches the filter/search controls.
- Categories & Tags now has tag search and usage filtering.
