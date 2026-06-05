import type { AuctionEntry, ItemPriceSummary, PriceSource } from '@/types/auction'
import { MANUAL_SELLER } from '@/types/auction'
import { calcMin, calcAvg, calcMedian } from '@/lib/money'

export function buildItemSummaries(entries: AuctionEntry[]): Map<string, ItemPriceSummary> {
  const groups = new Map<string, AuctionEntry[]>()
  for (const entry of entries) {
    const key = entry.itemName.toLowerCase()
    const list = groups.get(key) ?? []
    list.push(entry)
    groups.set(key, list)
  }

  const summaries = new Map<string, ItemPriceSummary>()
  for (const [key, group] of groups) {
    const prices = group.map(e => e.unitPrice).filter(p => p > 0)
    const totalQuantity = group.reduce((s, e) => s + e.quantity, 0)
    const lastScanDate = group.reduce((latest, e) =>
      e.scanDate > latest ? e.scanDate : latest, '')

    summaries.set(key, {
      itemName: group[0].itemName,
      minPrice: calcMin(prices),
      avgPrice: calcAvg(prices),
      medianPrice: calcMedian(prices),
      totalQuantity,
      auctionCount: group.length,
      lastScanDate,
      entries: group,
      isManual: group.every(e => e.seller === MANUAL_SELLER),
    })
  }
  return summaries
}

export function getPrice(summary: ItemPriceSummary, source: PriceSource, manualOverride?: number): number {
  if (source === 'manual' && manualOverride !== undefined) return manualOverride
  if (source === 'min') return summary.minPrice
  if (source === 'median') return summary.medianPrice
  return summary.avgPrice
}

export function lookupPrice(
  itemName: string,
  summaries: Map<string, ItemPriceSummary>,
  source: PriceSource,
  manualPrices?: Map<string, number>
): number | null {
  const key = itemName.toLowerCase()
  const summary = summaries.get(key)
  // Manual price is always a fallback when auction data is missing,
  // and takes full priority when source === 'manual'
  const manual = manualPrices?.get(key)
  if (source === 'manual' && manual !== undefined) return manual
  if (summary) return getPrice(summary, source)
  // No auction data — use manual price regardless of source mode
  if (manual !== undefined) return manual
  return null
}
