'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type FontType = 'space-grotesk' | 'roboto' | 'open-sans' | 'geist-sans' | 'montserrat' | 'lato' | 'inter'

interface FontContextType {
  font: FontType
  setFont: (font: FontType) => void
}

const FontContext = createContext<FontContextType | undefined>(undefined)

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = useState<FontType>('space-grotesk')

  useEffect(() => {
    const savedFont = localStorage.getItem('vance-font') as FontType
    if (savedFont) {
      setFontState(savedFont)
      document.body.setAttribute('data-font', savedFont)
    } else {
      document.body.setAttribute('data-font', 'space-grotesk')
    }
  }, [])

  const setFont = (newFont: FontType) => {
    setFontState(newFont)
    localStorage.setItem('vance-font', newFont)
    document.body.setAttribute('data-font', newFont)
  }

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  )
}

export function useFont() {
  const context = useContext(FontContext)
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider')
  }
  return context
}
