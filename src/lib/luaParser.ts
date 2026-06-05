import type { AuctionEntry } from '@/types/auction'
import { decode as cborDecode } from 'cbor-x'
import { WOW_ITEM_NAMES } from '@/data/wowItemNames'

export interface ParsedLuaResult {
  realm: string | null
  entries: AuctionEntry[]
  parseErrors: string[]
  source: 'price_database' | 'posting_history' | 'mixed' | 'none'
}

export function parseAuctionatorLua(content: string): ParsedLuaResult {
  const result: ParsedLuaResult = {
    realm: null,
    entries: [],
    parseErrors: [],
    source: 'none',
  }

  const realmMatch = content.match(/AUCTIONATOR_PRICE_DATABASE\s*=\s*\{[^}]*\["([^"_][^"]+)"\]/)
  if (realmMatch) result.realm = realmMatch[1]

  const postingEntries = parsePostingHistory(content)
  if (postingEntries.length > 0) {
    result.entries.push(...postingEntries)
    result.source = 'posting_history'
  }

  const priceEntries = parsePriceDatabase(content, result.parseErrors)
  if (priceEntries.length > 0) {
    const existing = new Map(result.entries.map(e => [e.itemName.toLowerCase(), e]))
    for (const e of priceEntries) existing.set(e.itemName.toLowerCase(), e)
    result.entries = [...existing.values()]
    result.source = postingEntries.length > 0 ? 'mixed' : 'price_database'
  }

  if (result.entries.length === 0) {
    result.parseErrors.push('No price data found. Try using a TSV export instead.')
  }

  return result
}

function parsePostingHistory(content: string): AuctionEntry[] {
  const startIdx = content.indexOf('AUCTIONATOR_POSTING_HISTORY = {')
  if (startIdx === -1) return []
  const block = extractLuaBlock(content, startIdx + 'AUCTIONATOR_POSTING_HISTORY = '.length)
  if (!block) return []

  const entries: AuctionEntry[] = []
  // Match item groups: ["itemId"] = { ... }
  // Use a manual scan approach to find each item ID block
  const idPattern = /\["(\d+)"\]\s*=\s*\{/g
  let m: RegExpExecArray | null

  while ((m = idPattern.exec(block)) !== null) {
    const itemId = m[1]
    const itemName = WOW_ITEM_NAMES[itemId]
    if (!itemName) continue

    // Find the end of this item's block
    const blockStart = m.index + m[0].length - 1
    const itemBlock = extractLuaBlock(block, blockStart)
    if (!itemBlock) continue

    const prices: number[] = []
    let totalQty = 0
    let lastTime = 0

    // Match each price entry inside the item block
    const entryPattern = /\["price"\]\s*=\s*(\d+)[\s\S]*?\["quantity"\]\s*=\s*(\d+)[\s\S]*?\["time"\]\s*=\s*(\d+)/g
    let em: RegExpExecArray | null
    while ((em = entryPattern.exec(itemBlock)) !== null) {
      prices.push(parseInt(em[1]))
      totalQty += parseInt(em[2])
      lastTime = Math.max(lastTime, parseInt(em[3]))
    }
    if (prices.length === 0) continue

    const minPrice = Math.min(...prices)
    entries.push({
      id: `ph-${itemId}`,
      itemName,
      quantity: totalQty,
      buyoutPrice: minPrice * totalQty,
      unitPrice: minPrice,
      seller: '',
      timeLeft: '',
      scanDate: lastTime ? new Date(lastTime * 1000).toISOString() : new Date().toISOString(),
    })
  }
  return entries
}

function parsePriceDatabase(content: string, errors: string[]): AuctionEntry[] {
  const dbStart = content.indexOf('AUCTIONATOR_PRICE_DATABASE = {')
  if (dbStart === -1) return []
  const block = extractLuaBlock(content, dbStart + 'AUCTIONATOR_PRICE_DATABASE = '.length)
  if (!block) return []

  // Match realm entries: ["RealmName"] = "binary-cbor-data"
  const realmPattern = /\["([^"_][^"]+)"\]\s*=\s*"((?:[^"\\]|\\.)*)"/g
  let m: RegExpExecArray | null
  const entries: AuctionEntry[] = []

  while ((m = realmPattern.exec(block)) !== null) {
    const realmName = m[1]
    if (realmName === '__dbversion') continue
    const luaStr = m[2]
    try {
      const bytes = decodeLuaString(luaStr)
      const decoded = cborDecode(bytes) as unknown
      entries.push(...extractEntriesFromCborData(decoded))
    } catch (e) {
      errors.push(`CBOR decode failed for realm "${realmName}": ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  return entries
}

function extractEntriesFromCborData(data: unknown): AuctionEntry[] {
  if (!data || typeof data !== 'object') return []
  const entries: AuctionEntry[] = []
  const obj = data as Record<string, unknown>
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__dbversion') continue
    if (!value || typeof value !== 'object') continue
    const itemData = value as Record<string | number, unknown>
    const minPrice = typeof itemData['m'] === 'number' ? (itemData['m'] as number) : 0
    if (minPrice <= 0) continue
    const itemName = resolveItemName(key)
    if (!itemName) continue
    entries.push({
      id: `pdb-${key}`,
      itemName,
      quantity: 1,
      buyoutPrice: minPrice,
      unitPrice: minPrice,
      seller: '',
      timeLeft: '',
      scanDate: new Date().toISOString(),
    })
  }
  return entries
}

function resolveItemName(key: string): string | null {
  if (key.startsWith('gr:')) {
    const parts = key.split(':')
    const baseName = WOW_ITEM_NAMES[parts[1]]
    if (!baseName) return null
    const suffix = parts.slice(2).join(':')
    return suffix ? `${baseName} ${suffix}` : baseName
  }
  if (key.startsWith('g:')) return WOW_ITEM_NAMES[key.split(':')[1]] ?? null
  if (key.startsWith('p:')) return WOW_ITEM_NAMES[key.slice(2)] ?? null
  return WOW_ITEM_NAMES[key] ?? null
}

// Convert a Lua string literal (with Lua escape sequences) to raw bytes
function decodeLuaString(luaStr: string): Uint8Array {
  const bytes: number[] = []
  let i = 0
  while (i < luaStr.length) {
    if (luaStr[i] === '\\') {
      i++
      if (i >= luaStr.length) break
      const ch = luaStr[i]
      if (ch >= '0' && ch <= '9') {
        // Decimal escape \ddd (1-3 digits)
        let numStr = ''
        while (numStr.length < 3 && i < luaStr.length && luaStr[i] >= '0' && luaStr[i] <= '9') {
          numStr += luaStr[i++]
        }
        bytes.push(parseInt(numStr, 10))
        continue
      }
      switch (ch) {
        case 'n':  bytes.push(10); break
        case 'r':  bytes.push(13); break
        case 't':  bytes.push(9);  break
        case '"':  bytes.push(34); break
        case "'":  bytes.push(39); break
        case '\\': bytes.push(92); break
        case 'a':  bytes.push(7);  break
        case 'b':  bytes.push(8);  break
        case 'f':  bytes.push(12); break
        case 'v':  bytes.push(11); break
        default:   bytes.push(ch.charCodeAt(0)); break
      }
      i++
    } else {
      // Non-ASCII chars in the JS string represent binary data read as UTF-8
      const code = luaStr.charCodeAt(i)
      if (code < 128) {
        bytes.push(code)
      } else if (code < 2048) {
        bytes.push((code >> 6) | 0xC0, (code & 0x3F) | 0x80)
      } else {
        bytes.push((code >> 12) | 0xE0, ((code >> 6) & 0x3F) | 0x80, (code & 0x3F) | 0x80)
      }
      i++
    }
  }
  return new Uint8Array(bytes)
}

function extractLuaBlock(content: string, fromIdx: number): string | null {
  const start = content.indexOf('{', fromIdx)
  if (start === -1) return null
  let depth = 0
  let inStr = false
  let strChar = ''
  for (let i = start; i < content.length; i++) {
    const ch = content[i]
    if (inStr) {
      if (ch === '\\') { i++; continue }
      if (ch === strChar) inStr = false
    } else {
      if (ch === '"' || ch === "'") { inStr = true; strChar = ch }
      else if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) return content.slice(start + 1, i)
      }
    }
  }
  return null
}

export function parseAuctionCSV(content: string): AuctionEntry[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []
  const header = lines[0].split('\t').map(h => h.trim().toLowerCase())
  const entries: AuctionEntry[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    if (cols.length < 2) continue
    const get = (field: string) => { const idx = header.indexOf(field); return idx >= 0 ? cols[idx]?.trim() ?? '' : '' }
    const itemName = get('item') || get('itemname') || get('name') || cols[0]?.trim()
    const unitPriceStr = get('unit price') || get('unitprice') || get('price') || cols[1]?.trim()
    const quantityStr = get('quantity') || get('qty') || cols[2]?.trim() || '1'
    if (!itemName) continue
    entries.push({
      id: `csv-${i}`,
      itemName,
      quantity: parseInt(quantityStr) || 1,
      buyoutPrice: (parseInt(unitPriceStr) || 0) * (parseInt(quantityStr) || 1),
      unitPrice: parseInt(unitPriceStr) || 0,
      seller: get('seller') || '',
      timeLeft: get('timeleft') || get('time left') || '',
      scanDate: new Date().toISOString(),
    })
  }
  return entries
}
