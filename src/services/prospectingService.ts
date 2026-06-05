import type { DropTable, ProspectingResult } from '@/types/prospecting'
import type { ItemPriceSummary, PriceSource } from '@/types/auction'
import { lookupPrice } from './auctionService'
import { multiplyCopper, safeDivideCopper } from '@/lib/money'

export function calculateProspecting(
  table: DropTable,
  inputQuantity: number,
  summaries: Map<string, ItemPriceSummary>,
  priceSource: PriceSource,
  manualPrices?: Map<string, number>,
  inputUnitPriceOverride?: number
): ProspectingResult {
  const inputUnitPrice = inputUnitPriceOverride ??
    lookupPrice(table.inputItem, summaries, priceSource, manualPrices) ?? 0
  const totalInputCost = multiplyCopper(inputUnitPrice, inputQuantity)

  const rolls = Math.floor(inputQuantity / table.inputQuantityPerRoll)
  const missingPrices: string[] = []

  const expectedDrops = table.possibleDrops.map(drop => {
    const expectedQty = drop.chance * ((drop.minQty + drop.maxQty) / 2) * rolls
    const unitPrice = lookupPrice(drop.itemName, summaries, priceSource, manualPrices)
    const missingPrice = unitPrice === null
    if (missingPrice) missingPrices.push(drop.itemName)
    const totalValue = unitPrice !== null ? Math.round(expectedQty * unitPrice) : 0
    return {
      itemName: drop.itemName,
      expectedQty: Math.round(expectedQty * 100) / 100,
      unitPrice: unitPrice ?? 0,
      totalValue,
      missingPrice,
    }
  })

  const expectedRevenue = expectedDrops.reduce((s, d) => s + d.totalValue, 0)
  const expectedProfit = expectedRevenue - totalInputCost
  const breakEvenUnitPrice = expectedRevenue > 0
    ? safeDivideCopper(expectedRevenue, inputQuantity)
    : 0

  return {
    inputItem: table.inputItem,
    inputQuantity,
    inputCostPerUnit: inputUnitPrice,
    totalInputCost,
    expectedDrops,
    expectedRevenue,
    expectedProfit,
    breakEvenUnitPrice,
    missingPrices,
  }
}
