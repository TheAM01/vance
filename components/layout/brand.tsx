import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * App brand wordmark (DM Sans, amber period) with a "by SolidPixel" tagline
 * ("SolidPixel" set in Space Grotesk). Color is inherited from the container,
 * so callers can recolor it by passing a text-* class. Used in the app chrome.
 */
export function Brand({
  collapsed = false,
  tagline = true,
  href = '/app',
  className,
}: {
  collapsed?: boolean
  tagline?: boolean
  href?: string
  className?: string
}) {
  if (collapsed) {
    return (
      <Link
        href={href}
        className={cn('font-heading text-lg font-semibold tracking-tight text-current', className)}
      >
        V<span className="text-highlight">.</span>
      </Link>
    )
  }

  return (
    <Link href={href} className={cn('inline-flex flex-col leading-none text-foreground', className)}>
      <span className="font-heading text-lg font-semibold tracking-tight text-current">
        Vance<span className="text-highlight">.</span>
      </span>
      {tagline && (
        <span className="mt-1 text-[10px] font-medium leading-none text-current opacity-60">
          by <span className="font-grotesk tracking-tight">SolidPixel</span>
        </span>
      )}
    </Link>
  )
}
