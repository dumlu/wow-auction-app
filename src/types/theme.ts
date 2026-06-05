export interface SavedTheme {
  id: string
  name: string
  cssBlock: string
  createdAt: string
}

export interface ThemeState {
  isDark: boolean
  activeThemeId: string | null
  themes: SavedTheme[]
}
