'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export const TEXTURES = [
  'none',
  '3px-tile',
  '45-degree-fabric-light',
  'arches',
  'asfalt-light',
  'axiom-pattern',
  'black-felt',
  'black-thread',
  'brick-wall',
  'carbon-fibre',
  'cardboard',
  'cartographer',
  'circles',
  'clean-gray-paper',
  'crissxcross',
  'diamond-upholstery',
  'dust',
  'fabric-plaid',
  'graphy',
  'grid-me',
  'hexellence',
  'low-contrast-linen',
  'micro-carbon',
  'pinstriped-suit',
  'pixel-weave',
  'retina-wood',
  'skulls',
  'stardust',
  'subtle-zebra-3d',
  'wavecut',
  'white-diamond',
  'white-sand',
] as const

export type TextureType = (typeof TEXTURES)[number]

const DEFAULT_TEXTURE: TextureType = 'none'

interface TextureContextType {
  texture: TextureType
  setTexture: (texture: TextureType) => void
}

const TextureContext = createContext<TextureContextType | undefined>(undefined)

export function TextureProvider({ children }: { children: React.ReactNode }) {
  const [texture, setTextureState] = useState<TextureType>(DEFAULT_TEXTURE)

  useEffect(() => {
    const saved = localStorage.getItem('vance-texture') as TextureType | null
    const resolved: TextureType = saved && (TEXTURES as readonly string[]).includes(saved) ? saved : DEFAULT_TEXTURE
    setTextureState(resolved)
    document.body.setAttribute('data-texture', resolved)
  }, [])

  const setTexture = (newTexture: TextureType) => {
    setTextureState(newTexture)
    localStorage.setItem('vance-texture', newTexture)
    document.body.setAttribute('data-texture', newTexture)
  }

  return (
    <TextureContext.Provider value={{ texture, setTexture }}>
      {children}
    </TextureContext.Provider>
  )
}

export function useTexture() {
  const context = useContext(TextureContext)
  if (context === undefined) {
    throw new Error('useTexture must be used within a TextureProvider')
  }
  return context
}
