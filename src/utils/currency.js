const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatPrice(value) {
  const price = Number(value)
  return rupiah.format(Number.isFinite(price) ? price : 0)
}
