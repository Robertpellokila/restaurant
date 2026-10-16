export function normalizeStock(value) {
  if (value == null || value === '') return null
  const stock = Number(value)
  return Number.isSafeInteger(stock) && stock >= 0 ? stock : null
}
