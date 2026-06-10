import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Globe, RefreshCw } from "lucide-react"
import { useAuctionStore } from "@/store/auctionStore"
import { parseAuctionatorLua, parseAuctionCSV } from "@/lib/luaParser"
import type { AuctionEntry, ImportSession } from "@/types/auction"
import { fetchRealms, type NexusHubRealm } from "@/services/nexusHub"

function generateId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return [...bytes].map((b, i) =>
    ([4, 6, 8, 10].includes(i) ? '-' : '') + b.toString(16).padStart(2, '0')
  ).join('')
}

export function AuctionImportPage() {
  const { sessions, useDemoData, toggleDemoData, clearAll, addEntries, entries, fetchWebPrices } = useAuctionStore()
  const [importing, setImporting] = useState(false)
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string; details?: string } | null>(null)
  const [realms, setRealms] = useState<NexusHubRealm[]>([])
  const [selectedRealm, setSelectedRealm] = useState<string>('thunderstrike-horde')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchRealms().then(setRealms).catch(console.error)
  }, [])

  async function handleWebUpdate() {
    setImporting(true)
    setLastResult(null)
    try {
      const count = await fetchWebPrices(selectedRealm)
      setLastResult({ success: true, message: `Successfully updated ${count} prices from NexusHub for ${selectedRealm}` })
    } catch (e) {
      setLastResult({ success: false, message: `Failed to fetch web prices: ${e instanceof Error ? e.message : String(e)}` })
    }
    setImporting(false)
  }

  async function handleFile(file: File) {
    setImporting(true)
    setLastResult(null)
    try {
      let content = ""
      if (file.name.toLowerCase().endsWith('.lua')) {
        // Read as ArrayBuffer then decode byte-by-byte to avoid Windows-1252 corruption.
        // Browsers map 'ISO-8859-1' to windows-1252 per the Encoding Standard, which remaps
        // bytes 0x80-0x9F to multi-byte Unicode chars. That corrupts the CBOR binary data
        // stored in AUCTIONATOR_PRICE_DATABASE. String.fromCharCode preserves each byte as-is.
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const bytes = new Uint8Array(reader.result as ArrayBuffer)
            const chars: string[] = new Array(bytes.length)
            for (let i = 0; i < bytes.length; i++) chars[i] = String.fromCharCode(bytes[i])
            resolve(chars.join(''))
          }
          reader.onerror = reject
          reader.readAsArrayBuffer(file)
        })
      } else {
        content = await file.text()
      }

      let importedEntries: AuctionEntry[] = []
      let realm: string | null = null

      if (file.name.toLowerCase().endsWith('.lua')) {
        const parsed = parseAuctionatorLua(content)
        realm = parsed.realm
        importedEntries = parsed.entries

        if (importedEntries.length === 0) {
          const detail = parsed.parseErrors.length > 0 ? parsed.parseErrors.join('\n') : undefined
          setLastResult({ success: false, message: 'No items found. Try a TSV export.', details: detail })
          setImporting(false)
          return
        }
        if (parsed.parseErrors.length > 0) {
          // Show errors but continue if we got some entries
          console.warn('LUA parse warnings:', parsed.parseErrors)
        }
      } else {
        importedEntries = parseAuctionCSV(content)
      }

      if (importedEntries.length === 0) {
        setLastResult({ success: false, message: 'No auction entries found in file. Try a CSV/TSV format instead.' })
        setImporting(false)
        return
      }

      const session: ImportSession = {
        id: generateId(),
        fileName: file.name,
        importDate: new Date().toISOString(),
        realm,
        entryCount: importedEntries.length,
      }

      addEntries(importedEntries, session)
      setLastResult({ success: true, message: `Imported ${importedEntries.length} entries from ${file.name}` })
    } catch (e) {
      setLastResult({ success: false, message: `Error reading file: ${e}` })
    }
    setImporting(false)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Auction Import</h1>
        <p className="text-muted-foreground text-sm mt-1">Import your Auctionator saved variables or CSV export</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Automatic Web Update</CardTitle>
              <CardDescription>Fetch latest market prices from NexusHub API</CardDescription>
            </div>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Select value={selectedRealm} onValueChange={setSelectedRealm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select realm" />
                </SelectTrigger>
                <SelectContent>
                  {realms.length > 0 ? (
                    realms.map(r => (
                      <SelectItem key={`${r.slug}-${r.faction}`} value={`${r.slug}-${r.faction}`}>
                        {r.name} - {r.faction.charAt(0).toUpperCase() + r.faction.slice(1)} ({r.region.toUpperCase()})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="thunderstrike-horde">Thunderstrike - Horde</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleWebUpdate} 
              disabled={importing}
              className="min-w-[140px]"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${importing ? 'animate-spin' : ''}`} />
              Update Prices
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            * Web prices will overwrite previous web data and supplement your Auctionator history.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Import File
            <Badge variant="outline" className="text-xs font-normal text-green-600 border-green-400">
              AH fiyat veritabanı aktif
            </Badge>
          </CardTitle>
          <CardDescription>
            Supported: Auctionator.lua (saved variables) or TSV/CSV with columns: item, unit price, quantity, seller
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">Drop file here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">.lua, .csv, .tsv files</p>
          </div>
          <input ref={fileRef} type="file" accept=".lua,.csv,.tsv,.txt" className="hidden" onChange={onFileChange} />

          {importing && <p className="text-sm text-muted-foreground">Importing...</p>}

          {lastResult && (
            <div className={`flex items-start gap-2 p-3 rounded-md text-sm ${lastResult.success ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' : 'bg-destructive/10 text-destructive'}`}>
              {lastResult.success ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
              <div>
                <p className="font-medium">{lastResult.message}</p>
                {lastResult.details && <pre className="mt-1 text-xs whitespace-pre-wrap">{lastResult.details}</pre>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format Reference</CardTitle>
          <CardDescription>If you want to manually create a price list, use this TSV format:</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`item\tunit price\tquantity\tseller\nCopper Ore\t300\t20\tMiner1\nTin Ore\t450\t20\tMiner2`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Import History</CardTitle>
            <CardDescription>{sessions.length} import sessions · {entries.length} total entries</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleDemoData}>
              {useDemoData ? 'Hide Demo Data' : 'Show Demo Data'}
            </Button>
            {entries.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => { if (confirm('Clear all imported data?')) clearAll() }}>
                <Trash2 className="h-4 w-4 mr-1" /> Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No imports yet</p>
          ) : (
            <div className="space-y-2">
              {[...sessions].reverse().map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-md border text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{session.fileName}</span>
                    {session.realm && <Badge variant="outline">{session.realm}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{session.entryCount} entries</span>
                    <span>{new Date(session.importDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
