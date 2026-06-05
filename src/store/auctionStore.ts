import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuctionEntry, ImportSession, PriceSource } from '@/types/auction'
import type { ItemPriceSummary } from '@/types/auction'
import { MANUAL_SELLER } from '@/types/auction'
import { buildItemSummaries } from '@/services/auctionService'
import { DEMO_AUCTIONS } from '@/data/demoAuctions'

interface AuctionState {
  entries: AuctionEntry[]
  sessions: ImportSession[]
  priceSource: PriceSource
  summaries: Map<string, ItemPriceSummary>
  useDemoData: boolean
  addEntries: (entries: AuctionEntry[], session: ImportSession) => void
  setPriceSource: (source: PriceSource) => void
  setManualPrice: (itemName: string, price: number) => void
  removeManualPrice: (itemName: string) => void
  toggleDemoData: () => void
  clearAll: () => void
}

function effectiveEntries(entries: AuctionEntry[], useDemoData: boolean): AuctionEntry[] {
  return useDemoData ? [...DEMO_AUCTIONS, ...entries.filter(e => e.seller === MANUAL_SELLER)] : entries
}

function buildSummaries(entries: AuctionEntry[]): Map<string, ItemPriceSummary> {
  return buildItemSummaries(entries)
}

function makeManualEntry(itemName: string, price: number): AuctionEntry {
  return {
    id: `manual-${itemName.toLowerCase().replace(/\s+/g, '-')}`,
    itemName,
    quantity: 1,
    buyoutPrice: price,
    unitPrice: price,
    seller: MANUAL_SELLER,
    timeLeft: '',
    scanDate: new Date().toISOString(),
  }
}

export const useAuctionStore = create<AuctionState>()(
  persist(
    (set, get) => ({
      entries: [],
      sessions: [],
      priceSource: 'min',
      summaries: buildSummaries(effectiveEntries([], true)),
      useDemoData: true,

      addEntries: (newEntries, session) => {
        // Keep existing manual entries, add new imported ones
        const manuals = get().entries.filter(e => e.seller === MANUAL_SELLER)
        const all = [...manuals, ...newEntries]
        set({
          entries: all,
          sessions: [...get().sessions, session],
          summaries: buildSummaries(all),
          useDemoData: false,
        })
      },

      setPriceSource: (source) => set({ priceSource: source }),

      setManualPrice: (itemName, price) => {
        const entry = makeManualEntry(itemName, price)
        const existing = get().entries.filter(
          e => !(e.seller === MANUAL_SELLER && e.itemName.toLowerCase() === itemName.toLowerCase())
        )
        const all = [...existing, entry]
        set({
          entries: all,
          summaries: buildSummaries(effectiveEntries(all, get().useDemoData)),
        })
      },

      removeManualPrice: (itemName) => {
        const all = get().entries.filter(
          e => !(e.seller === MANUAL_SELLER && e.itemName.toLowerCase() === itemName.toLowerCase())
        )
        set({
          entries: all,
          summaries: buildSummaries(effectiveEntries(all, get().useDemoData)),
        })
      },

      toggleDemoData: () => {
        const { useDemoData, entries } = get()
        set({
          useDemoData: !useDemoData,
          summaries: buildSummaries(effectiveEntries(entries, !useDemoData)),
        })
      },

      clearAll: () => set({
        entries: [],
        sessions: [],
        summaries: buildSummaries(effectiveEntries([], true)),
        useDemoData: true,
      }),
    }),
    {
      name: 'wow-auction-store-v2',
      partialize: (state) => ({
        entries: state.entries,
        sessions: state.sessions,
        priceSource: state.priceSource,
        useDemoData: state.useDemoData,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.summaries = buildSummaries(effectiveEntries(state.entries, state.useDemoData))
        }
      },
    }
  )
)

// Backward-compat helper: manual prices as Map for services
export function getManualPricesMap(entries: AuctionEntry[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const e of entries) {
    if (e.seller === MANUAL_SELLER) map.set(e.itemName.toLowerCase(), e.unitPrice)
  }
  return map
}
