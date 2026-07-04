'use client'

import React from 'react'

interface HeaderProps {
    title: string
    subtitle?: string
    children?: React.ReactNode
    maxWidth?: string
    hideOnMobile?: boolean
}

export function Header({ title, subtitle, children, maxWidth, hideOnMobile }: HeaderProps) {
    return (
        <header className={`${hideOnMobile ? 'hidden md:block' : ''} md:bg-white/20 md:dark:bg-background/20 md:backdrop-blur-md sticky top-0 z-40 border-b border-border/10`}>
            <div className={`w-full px-4 md:px-6 py-2 md:py-2 ${maxWidth ? `${maxWidth} mx-auto` : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="hidden md:block flex-1">
                        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {children && (
                            <div className="flex items-center gap-2">
                                {children}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
