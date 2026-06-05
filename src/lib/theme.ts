export interface ParsedTheme {
  name: string
  root: Record<string, string>
  dark: Record<string, string>
}

export function parseCSSVariableBlock(css: string): ParsedTheme {
  const result: ParsedTheme = { name: 'Custom', root: {}, dark: {} }
  const rootMatch = css.match(/:root\s*\{([^}]*)\}/s)
  const darkMatch = css.match(/\.dark\s*\{([^}]*)\}/s)

  function parseVars(block: string): Record<string, string> {
    const vars: Record<string, string> = {}
    const regex = /--([a-z0-9-]+)\s*:\s*([^;]+);/g
    let m
    while ((m = regex.exec(block)) !== null) {
      vars[m[1].trim()] = m[2].trim()
    }
    return vars
  }

  if (rootMatch) result.root = parseVars(rootMatch[1])
  if (darkMatch) result.dark = parseVars(darkMatch[1])
  if (Object.keys(result.root).length === 0 && Object.keys(result.dark).length === 0) {
    throw new Error('No valid CSS variables found. Expected :root { --variable: value; } blocks.')
  }
  return result
}

export function applyTheme(theme: ParsedTheme, isDark: boolean): void {
  const root = document.documentElement
  const vars = isDark ? { ...theme.root, ...theme.dark } : theme.root
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(`--${key}`, value)
  }
}

export function resetThemeToDefaults(): void {
  const root = document.documentElement
  const cssVarNames = [
    'background','foreground','card','card-foreground','popover','popover-foreground',
    'primary','primary-foreground','secondary','secondary-foreground','muted','muted-foreground',
    'accent','accent-foreground','destructive','destructive-foreground','border','input','ring','radius'
  ]
  for (const name of cssVarNames) {
    root.style.removeProperty(`--${name}`)
  }
}
