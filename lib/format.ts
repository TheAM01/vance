/**
 * Format a money value with its currency. A "word" currency (e.g. "Rs", "USD",
 * "PKR") gets a space before the number so it reads "Rs 15,000" rather than
 * "Rs15,000"; a symbol currency ("$", "€", "£") stays tight: "$15,000".
 * Any space the user explicitly typed (e.g. "Rs ") is preserved, never trimmed.
 */
export function formatMoney(amount: number | string | undefined, currency: string = '$'): string {
  const c = (currency ?? '$')
  const n = (Number(amount) || 0).toLocaleString()
  const needsSpace = /[A-Za-z0-9]$/.test(c) // ends in a letter/digit → word-like currency
  return `${c}${needsSpace ? ' ' : ''}${n}`
}
