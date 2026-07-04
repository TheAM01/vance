'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            if (res.ok) {
                router.push('/schedule')
                router.refresh()
            } else {
                setError('Invalid username or password.')
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative flex h-full flex-1 items-center justify-center p-4">
            {/* Ambient backdrop */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-highlight/10 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-sm animate-fade-in">
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary font-heading text-xl font-bold text-primary-foreground shadow-elevated">
                        V
                    </span>
                    <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Sign in to your Vance command center
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" /> Signing in…
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    Precision freelance operations · Vance
                </p>
            </div>
        </div>
    )
}
