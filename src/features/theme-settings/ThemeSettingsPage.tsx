import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { parseCSSVariableBlock, applyTheme, resetThemeToDefaults } from "@/lib/theme"
import { storageGet, storageSet } from "@/lib/storage"
import type { SavedTheme, ThemeState } from "@/types/theme"
import { CheckCircle, AlertCircle, Trash2, Palette } from "lucide-react"

interface ThemeSettingsPageProps {
  isDark: boolean
}

function loadThemeState(): ThemeState {
  return storageGet<ThemeState>('theme-state', { isDark: false, activeThemeId: null, themes: [] })
}

export function ThemeSettingsPage({ isDark }: ThemeSettingsPageProps) {
  const [state, setState] = useState<ThemeState>(loadThemeState)
  const [cssInput, setCssInput] = useState('')
  const [themeName, setThemeName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function save(updated: ThemeState) {
    setState(updated)
    storageSet('theme-state', updated)
  }

  function applyAndSave() {
    setError(null); setSuccess(null)
    try {
      const parsed = parseCSSVariableBlock(cssInput)
      parsed.name = themeName || parsed.name
      applyTheme(parsed, isDark)

      const saved: SavedTheme = {
        id: `theme-${Date.now()}`,
        name: parsed.name,
        cssBlock: cssInput,
        createdAt: new Date().toISOString(),
      }
      const updated = { ...state, themes: [...state.themes, saved], activeThemeId: saved.id }
      save(updated)
      setSuccess(`Theme "${parsed.name}" applied and saved!`)
      setCssInput('')
      setThemeName('')
    } catch (e) {
      setError(String(e))
    }
  }

  function activateTheme(theme: SavedTheme) {
    try {
      const parsed = parseCSSVariableBlock(theme.cssBlock)
      applyTheme(parsed, isDark)
      save({ ...state, activeThemeId: theme.id })
      setSuccess(`Theme "${theme.name}" applied`)
    } catch (e) {
      setError(String(e))
    }
  }

  function deleteTheme(id: string) {
    const updated = { ...state, themes: state.themes.filter(t => t.id !== id), activeThemeId: state.activeThemeId === id ? null : state.activeThemeId }
    if (state.activeThemeId === id) resetThemeToDefaults()
    save(updated)
  }

  function resetDefault() {
    resetThemeToDefaults()
    save({ ...state, activeThemeId: null })
    setSuccess('Reset to default theme')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Theme Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Customize with tweakcn-compatible CSS variable themes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apply tweakcn Theme</CardTitle>
          <CardDescription>
            Paste CSS variables from tweakcn.com. The block should contain :root and optionally .dark selectors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Theme Name (optional)</Label>
            <Input placeholder="My Theme" value={themeName} onChange={e => setThemeName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>CSS Variables Block</Label>
            <Textarea
              className="font-mono text-xs min-h-48"
              placeholder={`:root {\n  --background: 0 0% 100%;\n  --foreground: 222.2 84% 4.9%;\n  --primary: 222.2 47.4% 11.2%;\n  /* ... more variables */\n}\n\n.dark {\n  --background: 222.2 84% 4.9%;\n  /* ... */\n}`}
              value={cssInput}
              onChange={e => { setCssInput(e.target.value); setError(null); setSuccess(null) }}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 text-sm">
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={applyAndSave} disabled={!cssInput.trim()}>Apply & Save Theme</Button>
            <Button variant="outline" onClick={resetDefault}>Reset to Default</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Themes</CardTitle>
          <CardDescription>{state.themes.length} saved themes</CardDescription>
        </CardHeader>
        <CardContent>
          {state.themes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No saved themes yet. Apply a theme above to save it.</p>
          ) : (
            <div className="space-y-2">
              {state.themes.map(theme => (
                <div key={theme.id} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{theme.name}</span>
                    {state.activeThemeId === theme.id && <Badge variant="secondary">Active</Badge>}
                    <span className="text-xs text-muted-foreground">{new Date(theme.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => activateTheme(theme)}>Apply</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTheme(theme.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">How to use tweakcn</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Go to <strong>tweakcn.com</strong> and customize your theme</p>
          <p>2. Click "Export" and copy the CSS variables block</p>
          <p>3. Paste it in the textarea above and click "Apply & Save Theme"</p>
          <p>4. The theme applies live using CSS custom properties</p>
        </CardContent>
      </Card>
    </div>
  )
}
