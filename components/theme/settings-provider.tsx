'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type ViewMode = 'list' | 'board'
export type DefaultView = 'daily' | 'weekly'

interface SettingsContextType {
    defaultView: DefaultView
    setDefaultView: (view: DefaultView) => void
    strikethroughCompleted: boolean
    setStrikethroughCompleted: (val: boolean) => void
    glassyCards: boolean
    setGlassyCards: (val: boolean) => void
    compactCards: boolean
    setCompactCards: (val: boolean) => void
    /** Working-hours budget per day, fed to the auto-scheduler. */
    hoursPerDay: number
    setHoursPerDay: (val: number) => void
    currencySymbol: string
    setCurrencySymbol: (val: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [defaultView, setDefaultViewState] = useState<DefaultView>('weekly')
    const [strikethroughCompleted, setStrikethroughCompletedState] = useState(true)
    const [glassyCards, setGlassyCardsState] = useState(true)
    const [compactCards, setCompactCardsState] = useState(false)
    const [hoursPerDay, setHoursPerDayState] = useState(6)
    const [currencySymbol, setCurrencySymbolState] = useState('$')

    useEffect(() => {
        const dv = localStorage.getItem('vance_default_view') as DefaultView
        if (dv) setDefaultViewState(dv)

        const sc = localStorage.getItem('vance_strikethrough')
        if (sc !== null) setStrikethroughCompletedState(sc === 'true')

        const gc = localStorage.getItem('vance_glassy_cards')
        if (gc !== null) setGlassyCardsState(gc === 'true')

        const cc = localStorage.getItem('vance_compact_cards')
        if (cc !== null) setCompactCardsState(cc === 'true')

        const hpd = localStorage.getItem('vance_hours_per_day')
        if (hpd !== null && !isNaN(Number(hpd))) setHoursPerDayState(Number(hpd))

        const cur = localStorage.getItem('vance_currency_symbol')
        if (cur !== null) setCurrencySymbolState(cur)
    }, [])

    const setDefaultView = (view: DefaultView) => {
        setDefaultViewState(view)
        localStorage.setItem('vance_default_view', view)
    }
    const setStrikethroughCompleted = (val: boolean) => {
        setStrikethroughCompletedState(val)
        localStorage.setItem('vance_strikethrough', String(val))
    }
    const setGlassyCards = (val: boolean) => {
        setGlassyCardsState(val)
        localStorage.setItem('vance_glassy_cards', String(val))
    }
    const setCompactCards = (val: boolean) => {
        setCompactCardsState(val)
        localStorage.setItem('vance_compact_cards', String(val))
    }
    const setHoursPerDay = (val: number) => {
        const safe = isNaN(val) || val < 1 ? 1 : val
        setHoursPerDayState(safe)
        localStorage.setItem('vance_hours_per_day', String(safe))
    }
    const setCurrencySymbol = (val: string) => {
        setCurrencySymbolState(val)
        localStorage.setItem('vance_currency_symbol', val)
    }

    return (
        <SettingsContext.Provider value={{
            defaultView, setDefaultView,
            strikethroughCompleted, setStrikethroughCompleted,
            glassyCards, setGlassyCards,
            compactCards, setCompactCards,
            hoursPerDay, setHoursPerDay,
            currencySymbol, setCurrencySymbol,
        }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}
