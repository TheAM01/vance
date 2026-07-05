'use client'

import { useSettings } from '@/components/theme/settings-provider'
import { useTheme } from 'next-themes'
import { Minus, Plus, Sun, Moon, Monitor, CalendarClock, Palette, ListChecks } from '@/components/ui/icons'
import { PageHeader, PageBody } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

function Row({ label, desc, children, className }: { label: string; desc?: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0', className)}>
            <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{label}</div>
                {desc && <div className="mt-0.5 text-[13px] text-muted-foreground">{desc}</div>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    )
}

export default function SettingsPage() {
    const s = useSettings()
    const { theme, setTheme } = useTheme()

    const themeOptions = [
        { v: 'light', i: Sun, label: 'Light' },
        { v: 'dark', i: Moon, label: 'Dark' },
        { v: 'system', i: Monitor, label: 'System' },
    ] as const

    return (
        <div className="flex min-h-full flex-col">
            <PageHeader title="Settings" description="Tune Vance to your workflow." icon={Palette} />

            <PageBody width="narrow" className="space-y-6">
                {/* Scheduling */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarClock className="size-4 text-primary" /> Scheduling
                        </CardTitle>
                        <CardDescription>How the auto-scheduler packs and prices your work.</CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y divide-border py-2">
                        <Row label="Daily capacity" desc="Working hours per day used to auto-pack tasks.">
                            <div className="flex items-center gap-1 rounded-lg border border-input bg-card p-1">
                                <Button variant="ghost" size="icon-sm" onClick={() => s.setHoursPerDay(Math.max(1, s.hoursPerDay - 1))}>
                                    <Minus className="size-4" />
                                </Button>
                                <span className="w-12 text-center text-sm font-semibold tabular-nums">{s.hoursPerDay}h</span>
                                <Button variant="ghost" size="icon-sm" onClick={() => s.setHoursPerDay(s.hoursPerDay + 1)}>
                                    <Plus className="size-4" />
                                </Button>
                            </div>
                        </Row>
                        <Row label="Currency" desc="Symbol or code, e.g. $ or Rs.">
                            <Input
                                value={s.currencySymbol}
                                onChange={(e) => s.setCurrencySymbol(e.target.value)}
                                maxLength={6}
                                className="w-24 text-center"
                            />
                        </Row>
                        <Row label="Default schedule view" desc="Which view the Schedule opens in.">
                            <Select
                                value={s.defaultView}
                                onChange={(e) => s.setDefaultView(e.target.value as any)}
                                wrapperClassName="w-36"
                            >
                                <option value="weekly">Weekly</option>
                                <option value="daily">Daily</option>
                                <option value="list">List</option>
                            </Select>
                        </Row>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="size-4 text-primary" /> Appearance
                        </CardTitle>
                        <CardDescription>Choose how Vance looks on this device.</CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                        <Row label="Theme" desc="Light, dark, or follow your system.">
                            <div className="flex gap-1 rounded-lg border border-input bg-card p-1">
                                {themeOptions.map(({ v, i: Icon, label }) => (
                                    <button
                                        key={v}
                                        onClick={() => setTheme(v)}
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                                            theme === v
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        )}
                                        title={label}
                                    >
                                        <Icon className="size-4" />
                                        <span className="hidden sm:inline">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </Row>
                    </CardContent>
                </Card>

                {/* Tasks & Display */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListChecks className="size-4 text-primary" /> Tasks &amp; Lists
                        </CardTitle>
                        <CardDescription>Small behaviors for task and schedule lists.</CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                        <Row label="Strikethrough completed" desc="Cross out tasks once they're finished.">
                            <Switch checked={s.strikethroughCompleted} onCheckedChange={s.setStrikethroughCompleted} aria-label="Strikethrough completed tasks" />
                        </Row>
                    </CardContent>
                </Card>

                <p className="pt-2 text-xs text-muted-foreground">
                    Preferences are stored locally in your browser.
                </p>
            </PageBody>
        </div>
    )
}
