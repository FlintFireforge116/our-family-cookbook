# Family Cookbook V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an installable, mobile-first family recipe PWA with local IndexedDB operation, optional Firebase sync, recipe search/tags/sorting, random suggestion, and a weekly meal planner.

**Architecture:** Dependency-free browser ES modules with hash routing and a repository abstraction. A local IndexedDB repository is the default; a Firestore repository activates only when a Firebase web config is present. A handwritten service worker caches the app shell for offline use.

**Tech Stack:** HTML, CSS, modern browser JavaScript ES modules, IndexedDB, optional Firebase Auth/Firestore loaded from the official CDN, Service Worker, Node built-in test runner.

**Spec:** `docs/design.md`

## Global Constraints
- V1 must be usable without any paid service or billing details.
- Mobile-first, iPhone PWA friendly, responsive on larger screens.
- Warm muted cookbook visual direction; no AI-generated artwork in production UI.
- Recipe tags are user-created and a recipe can have multiple tags.
- Cloud mode uses a single shared Firebase login for the household.
- Local mode must work without credentials.
- Export/import backup includes recipe, planning, settings, and compressed images.

## Review Focus
- Broken/missing source URL must never break recipe rendering.
- Empty recipe libraries must give useful empty states rather than blank screens.
- Deleting a recipe referenced by the weekly planner must leave planner days safely empty.
- Invalid backup JSON must be rejected without destroying current data.
- Oversized/unusual image files must be compressed or rejected with a useful message.

---

### Task 1: Scaffold and domain utilities
**Files:** static app/config files, `src/domain/*`, Node unit tests.
**Produces:** Recipe/Planner types, tag normalization, sorting/filtering, image compression helpers.
- [ ] Write failing tests for tag normalization and recipe sorting/filtering.
- [ ] Run tests and verify RED.
- [ ] Implement domain utilities.
- [ ] Run full tests and verify GREEN.

### Task 2: Local repository and backup
**Files:** `src/data/localRepository.ts`, `src/data/repository.ts`, backup utilities, tests.
**Consumes:** domain types.
**Produces:** repository interface used by all pages.
- [ ] Write failing repository/backup tests.
- [ ] Verify RED.
- [ ] Implement IndexedDB repository and safe import/export.
- [ ] Verify GREEN.

### Task 3: Application shell and home screen
**Files:** `src/app.js`, `src/ui/*`, `styles.css`, home page and hash routing tests.
**Consumes:** repository provider.
- [ ] Write failing UI tests for home routes/copy.
- [ ] Verify RED.
- [ ] Implement visual system, app shell and home navigation.
- [ ] Verify GREEN.

### Task 4: Recipe library, editor, tags and random picker
**Files:** recipes pages/components/hooks and tests.
**Consumes:** repository interface and domain utilities.
- [ ] Write failing behavior tests for create/search/sort/tag/random flows.
- [ ] Verify RED.
- [ ] Implement pages and recipe photo capture/compression.
- [ ] Verify GREEN.

### Task 5: Weekly planner and settings/backup UI
**Files:** planner/settings pages and tests.
**Consumes:** repository and backup utilities.
- [ ] Write failing tests for assign/clear planner days and import failure safety.
- [ ] Verify RED.
- [ ] Implement My Week and Settings.
- [ ] Verify GREEN.

### Task 6: Optional Firebase shared sync and PWA packaging
**Files:** Firebase repository/auth/config, PWA manifest/service worker, GitHub Pages workflow, README, tests where practical.
**Consumes:** repository interface.
- [ ] Write failing configuration-selection tests.
- [ ] Verify RED.
- [ ] Implement Firebase shared-login repository and offline persistence.
- [ ] Add installable PWA packaging and setup documentation.
- [ ] Run tests and production build.
