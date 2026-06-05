export interface DropEntry {
  itemName: string
  chance: number
  minQty: number
  maxQty: number
}

export interface DropTable {
  id: string
  inputItem: string
  inputQuantityPerRoll: number
  possibleDrops: DropEntry[]
}

export interface ProspectingResult {
  inputItem: string
  inputQuantity: number
  inputCostPerUnit: number
  totalInputCost: number
  expectedDrops: { itemName: string; expectedQty: number; unitPrice: number; totalValue: number; missingPrice: boolean }[]
  expectedRevenue: number
  expectedProfit: number
  breakEvenUnitPrice: number
  missingPrices: string[]
}
