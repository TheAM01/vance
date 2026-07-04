import Link from 'next/link'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`font-space-grotesk font-black uppercase tracking-tighter text-foreground ${className}`}>
      VANCE
    </Link>
  )
}
