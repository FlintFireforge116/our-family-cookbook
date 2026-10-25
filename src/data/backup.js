export async function createBackup(repository) {
  const payload = {
    format: 'family-cookbook-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    recipes: await repository.listRecipes(),
    planners: await repository.listPlanners(),
    settings: await repository.getSettings(),
  }
  return JSON.stringify(payload, null, 2)
}

export function parseBackup(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('That file is not a valid cookbook backup.')
  }
  if (
    data?.format !== 'family-cookbook-backup' ||
    data?.version !== 1 ||
    !Array.isArray(data?.recipes) ||
    !data?.planners || typeof data.planners !== 'object' ||
    !data?.settings || typeof data.settings !== 'object'
  ) {
    throw new Error('That file is not a valid cookbook backup.')
  }
  return data
}

export async function importBackup(repository, text) {
  const data = parseBackup(text)
  await repository.replaceAll(data)
  return data
}
