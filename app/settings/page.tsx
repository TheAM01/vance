'use client'

import { Header } from '@/components/layout/header'
import { useSettings } from '@/components/theme/settings-provider'
import { useFont } from '@/components/theme/font-provider'
import { useTexture, TEXTURES } from '@/components/theme/texture-provider'
import { useTheme } from 'next-themes'
import { Minus, Plus, Sun, Moon, Monitor } from 'lucide-react'

const FONTS = ['space-grotesk', 'geist-sans', 'inter', 'roboto', 'open-sans', 'montserrat', 'lato'] as const

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-border/40">
            <div className="min-w-0">
                <div className="text-sm font-black uppercase tracking-tight">{label}</div>
                {desc && <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide mt-0.5">{desc}</div>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-lg font-black uppercase tracking-tighter mb-4 border-b-2 border-foreground inline-block">{title}</h2>
            <div className="bg-card border-2 border-border rounded-sm px-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] [&>div:last-child]:border-b-0">
                {children}
            </div>
        </section>
    )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!value)} className={`w-12 h-6 border-2 transition-colors flex items-center ${value ? 'bg-foreground border-foreground justify-end' : 'border-border justify-start'}`}>
            <span className={`w-4 h-4 m-0.5 ${value ? 'bg-background' : 'bg-muted-foreground'}`} />
        </button>
    )
}

const SELECT = 'px-3 py-2 bg-background border-2 border-border rounded-sm focus:outline-none focus:border-foreground text-foreground font-mono text-xs uppercase'

export default function SettingsPage() {
    const s = useSettings()
    const { font, setFont } = useFont()
    const { texture, setTexture } = useTexture()
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex flex-col min-h-full">
            <Header title="Settings" subtitle="Tune Vance to your workflow." />

            <div className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-6 space-y-10">
                {/* Scheduling */}
                <Section title="Scheduling">
                    <Row label="Daily Capacity" desc="Working hours per day used to auto-pack tasks">
                        <div className="flex items-center border-2 border-border">
                            <button onClick={() => s.setHoursPerDay(Math.max(1, s.hoursPerDay - 1))} className="p-2 hover:bg-muted transition-colors"><Minus size={13} /></button>
                            <span className="px-3 text-sm font-black tabular-nums">{s.hoursPerDay}h</span>
                            <button onClick={() => s.setHoursPerDay(s.hoursPerDay + 1)} className="p-2 hover:bg-muted transition-colors"><Plus size={13} /></button>
                        </div>
                    </Row>
                    <Row label="Currency" desc="Symbol or code, e.g. $ or Rs">
                        <input value={s.currencySymbol} onChange={e => s.setCurrencySymbol(e.target.value)} className={`${SELECT} w-24 text-center`} maxLength={6} />
                    </Row>
                    <Row label="Default Schedule View" desc="Daily or weekly grouping">
                        <select value={s.defaultView} onChange={e => s.setDefaultView(e.target.value as any)} className={SELECT}>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </Row>
                </Section>

                {/* Appearance */}
                <Section title="Appearance">
                    <Row label="Theme" desc="Light, dark or follow system">
                        <div className="flex border-2 border-border">
                            {[{ v: 'light', i: Sun }, { v: 'dark', i: Moon }, { v: 'system', i: Monitor }].map(({ v, i: I }) => (
                                <button key={v} onClick={() => setTheme(v)} className={`p-2 transition-colors ${theme === v ? 'bg-foreground text-background' : 'hover:bg-muted'}`} title={v}>
                                    <I size={15} />
                                </button>
                            ))}
                        </div>
                    </Row>
                    <Row label="Font" desc="App-wide typeface">
                        <select value={font} onChange={e => setFont(e.target.value as any)} className={SELECT}>
                            {FONTS.map(f => <option key={f} value={f}>{f.replace('-', ' ')}</option>)}
                        </select>
                    </Row>
                    <Row label="Background Texture" desc="Subtle surface pattern">
                        <select value={texture} onChange={e => setTexture(e.target.value as any)} className={SELECT}>
                            {TEXTURES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </Row>
                </Section>

                {/* Cards */}
                <Section title="Cards & Lists">
                    <Row label="Strikethrough Completed" desc="Cross out finished tasks">
                        <Toggle value={s.strikethroughCompleted} onChange={s.setStrikethroughCompleted} />
                    </Row>
                    <Row label="Glassy Cards" desc="Translucent card surfaces">
                        <Toggle value={s.glassyCards} onChange={s.setGlassyCards} />
                    </Row>
                    <Row label="Compact Cards" desc="Tighter spacing in lists">
                        <Toggle value={s.compactCards} onChange={s.setCompactCards} />
                    </Row>
                </Section>

                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest pt-4">
                    Preferences are stored locally in your browser.
                </p>
            </div>
        </div>
    )
}
