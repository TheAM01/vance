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
export function PageHeader({ title, description, icon: Icon, children, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/65',
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary sm:flex">
              <Icon className="size-[18px]" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate font-heading text-lg font-semibold tracking-tight text-foreground md:text-xl">
              {title}
            </h1>
            {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
          </div>
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
