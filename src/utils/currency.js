/**
 * Format a numeric value as Iraqi Dinar with thousands separators.
 * Example: formatIQD(50000) -> "50,000 د.ع"
 */
export function formatIQD(value) {
  const num = Number(value) || 0
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(num)
  return `${formatted} د.ع`
}
