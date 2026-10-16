import { normalizeStock } from '../utils/stock.js'

// Firebase returns an object keyed by record ID, an array, or null for an empty node.
// Always use the Firebase key as the ID so detail URLs and cart IDs agree.
export function normalizeCollection(data, normalize = (record) => record) {
  if (data == null) return []
  if (typeof data !== 'object') throw new Error('Format data tidak valid.')

  return Object.entries(data)
    .filter(([, record]) => record && typeof record === 'object' && !Array.isArray(record))
    .map(([id, record]) => normalize({ ...record, id }))
}

export function normalizeRecord(data, id, normalize = (record) => record) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Data tidak ditemukan.')
  }

  return normalize({ ...data, id: String(id) })
}

export function normalizeProduct(product) {
  const price = Number(product.price)
  return {
    ...product,
    title: product.name || product.title || 'Produk',
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    thumbnail: product.imageUrl || product.thumbnail || product.image || '',
    stock: normalizeStock(product.stock),
  }
}

function toList(value) {
  return value && typeof value === 'object' ? Object.values(value).filter(Boolean) : []
}

export function normalizeRecipe(recipe) {
  return {
    ...recipe,
    image: recipe.imageUrl || recipe.image || '',
    category: recipe.category || toList(recipe.mealType)[0] || 'Lainnya',
    time: Number(recipe.time ?? (
      Number(recipe.prepTimeMinutes || 0) + Number(recipe.cookTimeMinutes || 0)
    )),
    ingredients: toList(recipe.ingredients),
    steps: toList(recipe.steps ?? recipe.instructions),
    description: recipe.description || `Resep ${recipe.name || 'pilihan'} untuk dicoba di rumah.`,
  }
}
