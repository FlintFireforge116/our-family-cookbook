export function validateImageMeta(file) {
  if (!String(file?.type ?? '').startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }
  if ((Number(file?.size) || 0) > 15 * 1024 * 1024) {
    throw new Error('Please choose an image smaller than 15 MB.')
  }
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read that image.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not open that image.'))
    image.src = dataUrl
  })
}

export function dataUrlBytes(dataUrl) {
  const base64 = String(dataUrl).split(',')[1] ?? ''
  return Math.ceil(base64.length * 0.75)
}

export async function compressImage(file) {
  validateImageMeta(file)
  const source = await readFile(file)
  const image = await loadImage(source)
  const maxDimension = 1000
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser could not process that image.')
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  let quality = 0.82
  let data = canvas.toDataURL('image/jpeg', quality)
  while (dataUrlBytes(data) > 450_000 && quality > 0.42) {
    quality -= 0.08
    data = canvas.toDataURL('image/jpeg', quality)
  }
  if (dataUrlBytes(data) > 550_000) {
    throw new Error('That photo is still too large after compression. Please choose a smaller image.')
  }
  return data
}
