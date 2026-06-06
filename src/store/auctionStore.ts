import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { AuctionEntry, ImportSession, PriceSource } from '@/types/auction'
import type { ItemPriceSummary } from '@/types/auction'
import { MANUAL_SELLER } from '@/types/auction'
import { buildItemSummaries } from '@/services/auctionService'
import { DEMO_AUCTIONS } from '@/data/demoAuctions'
import { storageGet, storageSet } from '@/lib/storage'

interface AuctionState {
  entries: AuctionEntry[]
  sessions: ImportSession[]
  priceSource: PriceSource
  summaries: Map<string, ItemPriceSummary>
  useDemoData: boolean
  loading: boolean
  initialize: () => Promise<void>
  addEntries: (entries: AuctionEntry[], session: ImportSession) => Promise<void>
  setPriceSource: (source: PriceSource) => void
  setManualPrice: (itemName: string, price: number) => Promise<void>
  removeManualPrice: (itemName: string) => Promise<void>
  toggleDemoData: () => void
  clearAll: () => Promise<void>
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

function toDbEntry(e: AuctionEntry, userId: string, sessionId: string | null) {
  return {
    id: e.id,
    user_id: userId,
    session_id: sessionId,
    item_name: e.itemName,
    quantity: e.quantity,
    buyout_price: e.buyoutPrice,
    unit_price: e.unitPrice,
    seller: e.seller,
    time_left: e.timeLeft,
    scan_date: e.scanDate,
  }
}

function fromDbEntry(row: Record<string, unknown>): AuctionEntry {
  return {
    id: row.id as string,
    itemName: row.item_name as string,
    quantity: row.quantity as number,
    buyoutPrice: row.buyout_price as number,
    unitPrice: row.unit_price as number,
    seller: row.seller as string,
    timeLeft: (row.time_left as string) ?? '',
    scanDate: row.scan_date as string,
  }
}

export const useAuctionStore = create<AuctionState>()((set, get) => ({
  entries: [],
  sessions: [],
  priceSource: storageGet<PriceSource>('price-source', 'min'),
  summaries: buildSummaries(effectiveEntries([], true)),
  useDemoData: true,
  loading: false,

  initialize: async () => {
    set({ loading: true })
    const [{ data: sessionsData }, { data: entriesData }] = await Promise.all([
      supabase.from('import_sessions').select('*').order('import_date', { ascending: false }),
      supabase.from('auction_entries').select('*'),
    ])

    const entries: AuctionEntry[] = (entriesData ?? []).map(fromDbEntry)
    const sessions: ImportSession[] = (sessionsData ?? []).map((s: Record<string, unknown>) => ({
      id: s.id as string,
      fileName: s.file_name as string,
      importDate: s.import_date as string,
      realm: s.realm as string | null,
      entryCount: s.entry_count as number,
    }))

    const useDemoData = storageGet('use-demo-data', entries.length === 0)
    set({
      entries,
      sessions,
      useDemoData,
      summaries: buildSummaries(effectiveEntries(entries, useDemoData)),
      loading: false,
    })
  },

  addEntries: async (newEntries, session) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Replace previous imported entries (keep only manual + new import)
    await supabase.from('auction_entries').delete().eq('user_id', user.id).neq('seller', MANUAL_SELLER)

    await supabase.from('import_sessions').insert({
      id: session.id,
      user_id: user.id,
      file_name: session.fileName,
      import_date: session.importDate,
      realm: session.realm ?? null,
      entry_count: session.entryCount,
    })

    const CHUNK = 500
    for (let i = 0; i < newEntries.length; i += CHUNK) {
      await supabase.from('auction_entries').insert(
        newEntries.slice(i, i + CHUNK).map(e => toDbEntry(e, user.id, session.id))
      )
    }

    const manuals = get().entries.filter(e => e.seller === MANUAL_SELLER)
    const all = [...manuals, ...newEntries]
    set({
      entries: all,
      sessions: [...get().sessions, session],
      summaries: buildSummaries(all),
      useDemoData: false,
    })
    storageSet('use-demo-data', false)
  },

  setPriceSource: (source) => {
    storageSet('price-source', source)
    set({ priceSource: source })
  },

  setManualPrice: async (itemName, price) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const entry = makeManualEntry(itemName, price)
    await supabase.from('auction_entries').upsert(toDbEntry(entry, user.id, null))

    const existing = get().entries.filter(
      e => !(e.seller === MANUAL_SELLER && e.itemName.toLowerCase() === itemName.toLowerCase())
    )
    const all = [...existing, entry]
    set({ entries: all, summaries: buildSummaries(effectiveEntries(all, get().useDemoData)) })
  },

  removeManualPrice: async (itemName) => {
    const entryId = `manual-${itemName.toLowerCase().replace(/\s+/g, '-')}`
    await supabase.from('auction_entries').delete().eq('id', entryId)

    const all = get().entries.filter(
      e => !(e.seller === MANUAL_SELLER && e.itemName.toLowerCase() === itemName.toLowerCase())
    )
    set({ entries: all, summaries: buildSummaries(effectiveEntries(all, get().useDemoData)) })
  },

  toggleDemoData: () => {
    const next = !get().useDemoData
    storageSet('use-demo-data', next)
    set(s => ({ useDemoData: next, summaries: buildSummaries(effectiveEntries(s.entries, next)) }))
  },

  clearAll: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await Promise.all([
      supabase.from('auction_entries').delete().eq('user_id', user.id),
      supabase.from('import_sessions').delete().eq('user_id', user.id),
    ])

    set({
      entries: [],
      sessions: [],
      summaries: buildSummaries(effectiveEntries([], true)),
      useDemoData: true,
    })
    storageSet('use-demo-data', true)
  },
}))

export function getManualPricesMap(entries: AuctionEntry[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const e of entries) {
    if (e.seller === MANUAL_SELLER) map.set(e.itemName.toLowerCase(), e.unitPrice)
  }
  return map
}
