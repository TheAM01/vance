import Link from 'next/link'
import { cn } from '@/lib/utils'

/** App brand wordmark (DM Sans, amber period). Used in the app chrome. */
export function Brand({
  collapsed = false,
  href = '/app',
  className,
}: {
  collapsed?: boolean
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn('font-heading text-lg font-semibold tracking-tight text-foreground', className)}
    >
      {collapsed ? 'V' : 'Vance'}
      <span className="text-highlight">.</span>
    </Link>
  )
}
