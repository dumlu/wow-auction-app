export interface AuctionEntry {
  id: string
  itemName: string
  quantity: number
  buyoutPrice: number
  unitPrice: number
  seller: string
  timeLeft: string
  scanDate: string
}

export interface ItemPriceSummary {
  itemName: string
  minPrice: number
  avgPrice: number
  medianPrice: number
  totalQuantity: number
  auctionCount: number
  lastScanDate: string
  entries: AuctionEntry[]
  isManual: boolean   // true when all entries are manually entered
}

export const MANUAL_SELLER = '__manual__'

export type PriceSource = 'min' | 'avg' | 'median' | 'manual'

export interface ImportSession {
  id: string
  fileName: string
  importDate: string
  realm: string | null
  entryCount: number
}

export interface ColumnMapping {
  itemName: string
  quantity: string
  buyoutPrice: string
  unitPrice: string
  seller: string
  timeLeft: string
  scanDate: string
}
