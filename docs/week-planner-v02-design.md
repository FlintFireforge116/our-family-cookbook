# Weekly Meal Planner V0.2 Design

## Intent
Keep the current warm, flat illustrated cookbook look. Fix the clipped arched home title and make My Week a real planning board rather than a set of dropdowns.

## Behaviour
- Home title always fits inside its SVG at phone and desktop widths.
- Each week has a meal pool (`meals`) containing recipes selected for that week.
- Each weekday keeps one optional assigned recipe. Assigning does not remove the recipe from the meal pool.
- Recipes can be added to the current week's meal pool from recipe list cards, recipe detail, and the random suggestion.
- My Week shows the meal pool and seven day slots side-by-side on wider screens and stacked on phones.
- Desktop/pointer users can drag a meal card onto a day. All users can use a native day selector on each meal card.
- Removing a meal from the weekly pool also clears any day that points to it.
- Old planner records/backups without `meals` remain valid.

## Data shape
`{ meals: string[], monday: string|null, ..., sunday: string|null }`

## Constraints
- Keep V1 colour palette and illustration language.
- No paid services or new dependencies.
- Preserve local IndexedDB and Firebase repository compatibility.
