import type { AuctionEntry, ItemPriceSummary, PriceSource } from '@/types/auction'
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
  const manual = manualPrices?.get(key)
  if (source === 'manual' && manual !== undefined) return manual
  const summary = summaries.get(key)
  if (!summary) return null
  return getPrice(summary, source)
}
