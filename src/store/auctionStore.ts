import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuctionEntry, ImportSession, PriceSource } from '@/types/auction'
import type { ItemPriceSummary } from '@/types/auction'
import { buildItemSummaries } from '@/services/auctionService'
import { DEMO_AUCTIONS } from '@/data/demoAuctions'

interface AuctionState {
  entries: AuctionEntry[]
  sessions: ImportSession[]
  priceSource: PriceSource
  manualPrices: Record<string, number>
  summaries: Map<string, ItemPriceSummary>
  useDemoData: boolean
  addEntries: (entries: AuctionEntry[], session: ImportSession) => void
  setPriceSource: (source: PriceSource) => void
  setManualPrice: (itemName: string, price: number) => void
  toggleDemoData: () => void
  clearAll: () => void
}

function buildSummaries(entries: AuctionEntry[]): Map<string, ItemPriceSummary> {
  return buildItemSummaries(entries)
}

export const useAuctionStore = create<AuctionState>()(
  persist(
    (set, get) => ({
      entries: [],
      sessions: [],
      priceSource: 'min',
      manualPrices: {},
      summaries: buildSummaries(DEMO_AUCTIONS),
      useDemoData: true,

      addEntries: (newEntries, session) => {
        const all = [...get().entries, ...newEntries]
        set({
          entries: all,
          sessions: [...get().sessions, session],
          summaries: buildSummaries(all),
          useDemoData: false,
        })
      },

      setPriceSource: (source) => set({ priceSource: source }),

      setManualPrice: (itemName, price) => {
        set(state => ({
          manualPrices: { ...state.manualPrices, [itemName.toLowerCase()]: price }
        }))
      },

      toggleDemoData: () => {
        const { useDemoData, entries } = get()
        const effective = useDemoData ? DEMO_AUCTIONS : entries
        set({
          useDemoData: !useDemoData,
          summaries: buildSummaries(effective),
        })
      },

      clearAll: () => set({
        entries: [],
        sessions: [],
        summaries: buildSummaries(DEMO_AUCTIONS),
        useDemoData: true,
      }),
    }),
    {
      name: 'wow-auction-store',
      partialize: (state) => ({
        entries: state.entries,
        sessions: state.sessions,
        priceSource: state.priceSource,
        manualPrices: state.manualPrices,
        useDemoData: state.useDemoData,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const effective = state.useDemoData ? DEMO_AUCTIONS : state.entries
          state.summaries = buildSummaries(effective)
        }
      },
    }
  )
)
