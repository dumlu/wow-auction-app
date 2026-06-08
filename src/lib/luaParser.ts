import type { AuctionEntry } from '@/types/auction'
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
  if (realmMatch) result.realm = decodeUTF8String(realmMatch[1])

  const postingEntries = parsePostingHistory(content)
  console.log(`Parsed Posting History: ${postingEntries.length} entries`)
  if (postingEntries.length > 0) {
    result.entries.push(...postingEntries)
    result.source = 'posting_history'
  }

  const priceEntries = parsePriceDatabase(content, result.parseErrors)
  console.log(`Parsed Price Database: ${priceEntries.length} entries`)
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
  // Match item groups: ["itemId"] = { ... } or ["gr:itemId:suffix"] = { ... }
  const idPattern = /\["([^"]+)"\]\s*=\s*\{/g
  let m: RegExpExecArray | null

  while ((m = idPattern.exec(block)) !== null) {
    const itemId = m[1]
    const itemName = resolveItemName(itemId) || `Unknown Item (${decodeUTF8String(itemId)})`

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
  if (dbStart === -1) {
    console.warn('AUCTIONATOR_PRICE_DATABASE not found')
    return []
  }
  const block = extractLuaBlock(content, dbStart + 'AUCTIONATOR_PRICE_DATABASE = '.length)
  if (!block) {
    console.warn('Failed to extract Price Database block')
    return []
  }

  const entries: AuctionEntry[] = []

  // Parse realm entries manually to avoid regex stack overflow on multi-MB strings
  let pos = 0
  while (pos < block.length) {
    // Find next ["RealmName"] = "
    const keyStart = block.indexOf('["', pos)
    if (keyStart === -1) break
    const keyEnd = block.indexOf('"]', keyStart + 2)
    if (keyEnd === -1) break
    const rawRealm = block.slice(keyStart + 2, keyEnd)
    pos = keyEnd + 2

    // Skip whitespace and = sign
    const eqIdx = block.indexOf('=', pos)
    if (eqIdx === -1) break
    pos = eqIdx + 1
    while (pos < block.length && (block[pos] === ' ' || block[pos] === '\t')) pos++

    // If value is not a quoted string, skip (e.g. __dbversion = 8)
    if (block[pos] !== '"') {
      pos = block.indexOf('\n', pos)
      if (pos === -1) break
      continue
    }
    if (rawRealm === '__dbversion') {
      pos = block.indexOf('\n', pos)
      if (pos === -1) break
      continue
    }

    // Extract quoted Lua string manually (handles \" and \ddd escapes)
    pos++ // skip opening "
    const luaStrStart = pos
    while (pos < block.length) {
      if (block[pos] === '\\') { pos += 2; continue }
      if (block[pos] === '"') break
      pos++
    }
    const luaStr = block.slice(luaStrStart, pos)
    pos++ // skip closing "

    const realmName = decodeUTF8String(rawRealm)

    try {
      const bytes = decodeLuaString(luaStr)
      const realmEntries = parseCborPriceDatabase(bytes)
      entries.push(...realmEntries)
    } catch (e) {
      const errMsg = `CBOR decode failed for realm "${realmName}": ${e instanceof Error ? e.message : String(e)}`
      console.error(errMsg)
      errors.push(errMsg)
    }
  }
  return entries
}

// Minimal CBOR parser for Auctionator's price database.
// Uses a fully iterative skip (no recursion at all) to avoid any stack overflow.
function parseCborPriceDatabase(data: Uint8Array): AuctionEntry[] {
  let pos = 0
  const dec = new TextDecoder('latin1')

  function readCount(info: number): number {
    if (info < 24) return info
    if (info === 24) return data[pos++]
    if (info === 25) { const v = (data[pos] << 8) | data[pos + 1]; pos += 2; return v }
    if (info === 26) { const v = (data[pos] * 0x1000000) + ((data[pos + 1] << 16) | (data[pos + 2] << 8) | data[pos + 3]); pos += 4; return v }
    return 0
  }

  // Fully iterative skip — zero recursion.
  // Takes already-decoded major+count so callers don't double-consume.
  function skipBody(major: number, count: number): void {
    const levels: number[] = [] // remaining children at each depth
    let maj = major, cnt = count
    while (true) {
      let children = 0
      switch (maj) {
        case 2: case 3: pos += cnt; break
        case 4: children = cnt; break
        case 5: children = cnt * 2; break
        case 6: children = 1; break
      }
      if (children > 0) {
        levels.push(children - 1)
        const nb = data[pos++]; maj = nb >> 5; cnt = readCount(nb & 0x1f)
        continue
      }
      while (levels.length > 0) {
        if (levels[levels.length - 1] > 0) {
          levels[levels.length - 1]--
          const nb = data[pos++]; maj = nb >> 5; cnt = readCount(nb & 0x1f)
          break
        }
        levels.pop()
      }
      if (levels.length === 0) break
    }
  }

  function skipFrom(b: number): void { skipBody(b >> 5, readCount(b & 0x1f)) }

  function readStrFrom(b: number): string | null {
    const major = b >> 5
    const count = readCount(b & 0x1f)
    if (major === 2 || major === 3) {
      const s = dec.decode(data.subarray(pos, pos + count))
      pos += count
      return s
    }
    skipBody(major, count)
    return null
  }

  function readUintFrom(b: number): number {
    const major = b >> 5
    const count = readCount(b & 0x1f)
    if (major === 0) return count
    skipBody(major, count)
    return 0
  }

  const entries: AuctionEntry[] = []

  const topB = data[pos++]
  if ((topB >> 5) !== 5) return entries
  const topCount = readCount(topB & 0x1f)

  for (let i = 0; i < topCount; i++) {
    const itemKey = readStrFrom(data[pos++])
    if (itemKey === null) { skipFrom(data[pos++]); continue }
    if (itemKey === '__dbversion') { skipFrom(data[pos++]); continue }

    const vb = data[pos++]
    if ((vb >> 5) !== 5) { skipFrom(vb); continue }

    const fieldCount = readCount(vb & 0x1f)
    let minPrice = 0

    for (let j = 0; j < fieldCount; j++) {
      const fieldKey = readStrFrom(data[pos++])
      if (fieldKey === null) { skipFrom(data[pos++]); continue }

      if (fieldKey === 'm') {
        minPrice = readUintFrom(data[pos++])
        // skip remaining fields
        for (let k = j + 1; k < fieldCount; k++) {
          skipFrom(data[pos++]) // key
          skipFrom(data[pos++]) // value
        }
        break
      } else {
        skipFrom(data[pos++]) // skip value
      }
    }

    if (minPrice > 0) {
      const itemName = resolveItemName(itemKey) || `Unknown Item (${decodeUTF8String(itemKey)})`
      if (itemKey === '24036') console.log(`Nightseye raw minPrice: ${minPrice} copper = ${(minPrice/10000).toFixed(2)}g`)
      entries.push({
        id: `pdb-${itemKey}`,
        itemName,
        quantity: 1,
        buyoutPrice: minPrice,
        unitPrice: minPrice,
        seller: '',
        timeLeft: '',
        scanDate: new Date().toISOString(),
      })
    }
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
      bytes.push(luaStr.charCodeAt(i))
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

function decodeUTF8String(str: string): string {
  try {
    return decodeURIComponent(escape(str))
  } catch {
    return str
  }
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
