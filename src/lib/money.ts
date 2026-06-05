export function copperToGSC(copper: number): string {
  if (copper < 0) return `-${copperToGSC(-copper)}`
  const g = Math.floor(copper / 10000)
  const s = Math.floor((copper % 10000) / 100)
  const c = copper % 100
  const parts: string[] = []
  if (g > 0) parts.push(`${g}g`)
  if (s > 0) parts.push(`${s}s`)
  if (c > 0 || parts.length === 0) parts.push(`${c}c`)
  return parts.join(' ')
}

export function formatCopper(copper: number): string {
  return copperToGSC(copper)
}

export function parseGoldSilverCopper(input: string): number {
  const trimmed = input.trim().toLowerCase()
  let total = 0
  const goldMatch = trimmed.match(/(\d+)\s*g/)
  const silverMatch = trimmed.match(/(\d+)\s*s/)
  const copperMatch = trimmed.match(/(\d+)\s*c/)
  if (goldMatch) total += parseInt(goldMatch[1]) * 10000
  if (silverMatch) total += parseInt(silverMatch[1]) * 100
  if (copperMatch) total += parseInt(copperMatch[1])
  if (!goldMatch && !silverMatch && !copperMatch) {
    const num = parseInt(trimmed)
    if (!isNaN(num)) total = num
  }
  return total
}

export function addCopper(...values: number[]): number {
  return values.reduce((sum, v) => sum + Math.round(v), 0)
}

export function multiplyCopper(copper: number, factor: number): number {
  return Math.round(copper * factor)
}

export function safeDivideCopper(copper: number, divisor: number): number {
  if (divisor === 0) return 0
  return Math.round(copper / divisor)
}

export function calcMin(prices: number[]): number {
  if (prices.length === 0) return 0
  return Math.min(...prices)
}

export function calcAvg(prices: number[]): number {
  if (prices.length === 0) return 0
  return safeDivideCopper(prices.reduce((a, b) => a + b, 0), prices.length)
}

export function calcMedian(prices: number[]): number {
  if (prices.length === 0) return 0
  const sorted = [...prices].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : safeDivideCopper(sorted[mid - 1] + sorted[mid], 2)
}
