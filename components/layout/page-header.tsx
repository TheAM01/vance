import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: React.ReactNode
  className?: string
}

/** Sticky page header used across authenticated pages. */
export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-16 shrink-0 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/65',
        className
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:px-8">
        <div className="min-w-0">
          <h1 className="truncate font-heading text-lg font-semibold tracking-tight text-foreground md:text-xl">
            {title}
          </h1>
          {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
        </div>
        {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
      </div>
    </header>
  )
}

/** Consistent page content wrapper. */
export function PageBody({
  className,
  children,
  width = 'default',
}: {
  className?: string
  children: React.ReactNode
  width?: 'default' | 'wide' | 'narrow'
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-6 md:px-8',
        width === 'wide' && 'max-w-[1600px]',
        width === 'default' && 'max-w-6xl',
        width === 'narrow' && 'max-w-3xl',
        className
      )}
    >
      {children}
    </div>
  )
}
