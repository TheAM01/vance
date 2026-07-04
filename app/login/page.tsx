'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
                setError('Invalid credentials')
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center p-4 h-full">
            <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-sm border-2 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                <div className="text-center">
                    <h2 className="mt-6 text-4xl font-black tracking-tighter uppercase text-foreground">
                        Sign in to Vance
                    </h2>
                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Freelance Command Center</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-foreground">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="block w-full border-2 border-border bg-card px-4 py-3 text-foreground placeholder-muted-foreground focus:border-foreground focus:outline-none transition-colors font-mono text-sm"
                                placeholder="ENTER USERNAME"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-foreground">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="block w-full border-2 border-border bg-card px-4 py-3 text-foreground placeholder-muted-foreground focus:border-foreground focus:outline-none transition-colors font-mono text-sm"
                                placeholder="ENTER PASSWORD"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border-2 border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-tight text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center border-2 border-foreground bg-foreground px-4 py-3 text-sm font-black uppercase tracking-widest text-background hover:bg-background hover:text-foreground transition-all duration-200 disabled:opacity-50"
                        >
                            {isLoading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
