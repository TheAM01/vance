'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  CalendarRange,
  BarChart3,
  FolderKanban,
  Users,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
  Target,
} from '@/components/ui/icons'

// ─── Brand lockup ────────────────────────────────────────────────────────────
function Wordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link
      href="/"
      className={`font-heading text-lg font-semibold tracking-tight ${onDark ? 'text-white' : 'text-foreground'}`}
    >
      Vance<span className="text-highlight">.</span>
    </Link>
  )
}

// ─── Product screenshot in browser chrome ─────────────────────────────────────
function AppShot({
  name,
  url,
  forceDark = false,
  className = '',
}: {
  name: string
  url: string
  forceDark?: boolean
  className?: string
}) {
  return (
    <div className={`w-full overflow-hidden rounded-xl border border-border bg-card shadow-elevated ${className}`}>
      <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#FF5F56]" />
          <span className="size-3 rounded-full bg-[#FEBC2E]" />
          <span className="size-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="mx-2 flex flex-1 items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-1">
          <span className="size-1.5 shrink-0 rounded-full bg-success" />
          <span className="truncate font-mono text-[10px] text-muted-foreground">vance.app{url}</span>
        </div>
      </div>
      {forceDark ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/shots/${name}-dark.png`} alt={`Vance ${name}`} className="block w-full" />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/shots/${name}-light.png`} alt={`Vance ${name}`} className="block w-full dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/shots/${name}-dark.png`} alt={`Vance ${name}`} className="hidden w-full dark:block" />
        </>
      )}
    </div>
  )
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
function FadeIn({
  children, direction = 'up', delay = 0, className = '', disabled = false,
}: {
  children: React.ReactNode
  direction?: 'up' | 'left' | 'right' | 'none'
  delay?: number
  className?: string
  disabled?: boolean
}) {
  if (disabled) return <div className={className}>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y: direction === 'up' ? 28 : 0, x: direction === 'left' ? -28 : direction === 'right' ? 28 : 0 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Feature showcase row ─────────────────────────────────────────────────────
function Feature({
  tag, title, description, bullets, shot, url, tone, flip, isMobile,
}: {
  tag: string; title: string; description: string; bullets: string[]
  shot: string; url: string; tone: 'primary' | 'highlight'; flip?: boolean; isMobile: boolean
}) {
  const pill = tone === 'primary' ? 'bg-primary/10 text-primary' : 'bg-highlight/15 text-highlight'
  const check = tone === 'primary' ? 'text-primary' : 'text-highlight'
  return (
    <div className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20 ${flip ? 'lg:grid-flow-dense' : ''}`}>
      <FadeIn direction={flip ? 'right' : 'left'} className={flip ? 'lg:col-start-2' : ''} disabled={isMobile}>
        <div className="space-y-6">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${pill}`}>{tag}</span>
          <h3 className="whitespace-pre-line font-heading text-3xl font-bold leading-[1.1] tracking-tight text-foreground lg:text-4xl">{title}</h3>
          <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
          <ul className="space-y-2.5">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                <CheckCircle2 className={`mt-0.5 size-[18px] shrink-0 ${check}`} />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </FadeIn>
      <FadeIn direction={flip ? 'left' : 'right'} className={flip ? 'lg:col-start-1 lg:row-start-1' : ''} disabled={isMobile}>
        <AppShot name={shot} url={url} />
      </FadeIn>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Navbar is transparent-over-black while the hero is under it, solid once past.
  const heroRef = useRef<HTMLElement>(null)
  const [navSolid, setNavSolid] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsLoggedIn(document.cookie.includes('is_logged_in=true'))
    setIsMobile(window.innerWidth < 768)

    const onScroll = () => {
      const hero = heroRef.current
      const flip = hero ? hero.offsetHeight - 64 : 0 // nav height ≈ 64px
      setNavSolid(window.scrollY > flip)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const isGlobalDark = theme === 'dark'
  const launchHref = isLoggedIn ? '/schedule' : '/login'

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-highlight selection:text-highlight-foreground">
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
          navSolid
            ? 'border-border/60 bg-background/70 backdrop-blur-lg'
            : 'border-transparent bg-transparent'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 md:px-10">
          <Wordmark onDark={!navSolid} />
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-6 md:flex">
              {[
                { href: '#what', label: 'What it does' },
                { href: '#features', label: 'Features' },
                { href: '#gallery', label: 'Gallery' },
              ].map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'text-sm transition-colors',
                    navSolid ? 'text-muted-foreground hover:text-foreground' : 'text-white/70 hover:text-white'
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <button
              onClick={() => setTheme(isGlobalDark ? 'light' : 'dark')}
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-lg border transition-colors',
                navSolid
                  ? 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                  : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
              )}
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {mounted && isGlobalDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </button>
            <Link
              href={launchHref}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Launch <span className="hidden sm:inline">app</span> <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO (solid charcoal-black) ─────────────────────────────────── */}
      <section ref={heroRef} className="relative flex h-screen min-h-[560px] flex-col items-center justify-center overflow-hidden bg-[#0c0f13] px-6">
        {/* subtle, static amber glow + grid — no shader */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.6]"
          style={{ background: 'radial-gradient(60% 50% at 50% 8%, rgba(255,158,32,0.12), transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '64px 64px' }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-background" />

        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center">
          <h1 className="font-heading font-black leading-[0.85] tracking-tighter text-white text-[clamp(4rem,17vw,15rem)]">
            VANCE<span className="text-highlight">.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Run every client project end-to-end, let your tasks schedule themselves, keep your people
            and revenue in view — one calm, professional workspace built for freelancers who ship a lot.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href={launchHref}
              className="group inline-flex items-center gap-2 rounded-lg bg-highlight px-8 py-3.5 text-sm font-semibold text-highlight-foreground shadow-elevated transition-transform hover:-translate-y-0.5"
            >
              {isLoggedIn ? 'Open your workspace' : 'Get started'}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="#what" className="rounded-lg border border-white/20 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10">
              See what it does
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRODUCT SHOT ────────────────────────────────────────────────── */}
      <section className="border-b border-border px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <FadeIn disabled={isMobile}>
            <AppShot name="schedule" url="/schedule" />
          </FadeIn>
        </div>
      </section>

      {/* ── WHAT WE DO ──────────────────────────────────────────────────── */}
      <section id="what" className="px-6 py-24 md:px-12 lg:px-20">
        <FadeIn className="mx-auto max-w-3xl text-center" disabled={isMobile}>
          <p className="mb-3 text-sm font-semibold text-primary">What Vance does</p>
          <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            The operating system for a freelance practice
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Vance replaces the tangle of spreadsheets, sticky notes and calendar guesswork that comes with
            running client work solo. Log every project once — scope, client, money, links, tasks and
            revision requests — and Vance turns it into a live day-by-day plan, a picture of who you work with,
            and hard numbers on where your time and revenue actually go.
          </p>
        </FadeIn>

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FolderKanban, title: 'Projects', tag: 'Core', tone: 'primary', desc: 'Every engagement in one place — tasks, changes, money, links and status. Full CRUD, zero spreadsheets.' },
            { icon: CalendarRange, title: 'Auto scheduler', tag: 'Automation', tone: 'highlight', desc: 'Estimates + deadlines in, a packed day-by-day plan out. At-risk and overdue work flagged automatically.' },
            { icon: Users, title: 'Contacts', tag: 'CRM', tone: 'primary', desc: 'Clients, leads and collaborators with relationship status, details and the projects they belong to.' },
            { icon: BarChart3, title: 'Analytics', tag: 'Intelligence', tone: 'highlight', desc: 'Revenue earned vs pending, time per project, your busiest fields and how often each client asks for changes.' },
          ].map(({ icon: Icon, title, tag, tone, desc }, i) => {
            const chip = tone === 'primary' ? 'bg-primary/10 text-primary' : 'bg-highlight/15 text-highlight'
            return (
              <FadeIn key={title} delay={i * 0.07} disabled={isMobile}>
                <div className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated">
                  <div className="mb-5 flex items-center justify-between">
                    <div className={`flex size-11 items-center justify-center rounded-xl ${chip}`}>
                      <Icon className="size-5" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{tag}</span>
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">{title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </section>

      {/* ── SHOWCASES (real screenshots) ────────────────────────────────── */}
      <section id="features" className="space-y-28 bg-muted/30 px-6 py-24 md:px-12 lg:px-20">
        <Feature
          tag="Scheduler"
          title={'Tasks that\nschedule themselves'}
          description="Give each task an estimate, a priority and a deadline. Vance sorts by urgency and packs them into your working days — so you always know exactly what to do next, and what's about to slip."
          bullets={['Automatic deadline-aware day packing', 'Configurable daily working-hour budget', 'At-risk & overdue flagging', 'Week, day and list views']}
          shot="schedule"
          url="/schedule"
          tone="highlight"
          isMobile={isMobile}
        />
        <Feature
          tag="Analytics"
          title={'Know exactly where\nyour time & money go'}
          description="Revenue earned and pending, hours per project, the fields you work in most, and how many changes each client demands — the numbers that tell you which work is actually worth it."
          bullets={['Earned vs pending revenue', 'Time and effort per project', 'Field & source breakdowns', 'Change-request frequency']}
          shot="analytics"
          url="/analytics"
          tone="primary"
          flip
          isMobile={isMobile}
        />
        <Feature
          tag="Dashboard"
          title={'Your whole practice,\nat a glance'}
          description="Open Vance to today's focus: active projects, pending tasks, revenue on the line and exactly what's scheduled for today — without digging through anything."
          bullets={['Live KPIs across your practice', "Today's focus, front and center", 'Upcoming schedule preview', 'One click into any project']}
          shot="dashboard"
          url="/app"
          tone="highlight"
          isMobile={isMobile}
        />
      </section>

      {/* ── GALLERY (dark & light) ──────────────────────────────────────── */}
      <section id="gallery" className="px-6 py-24 md:px-12 lg:px-20">
        <FadeIn className="mx-auto mb-12 max-w-2xl text-center" disabled={isMobile}>
          <p className="mb-3 text-sm font-semibold text-primary">Gallery</p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">Beautiful in dark &amp; light</h2>
          <p className="mt-4 text-base text-muted-foreground">A crafted teal-and-amber system that looks intentional in either theme.</p>
        </FadeIn>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          <FadeIn disabled={isMobile}>
            <div className="rounded-xl border border-border bg-card p-2 shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shots/dashboard-light.png" alt="Vance dashboard, light theme" className="w-full rounded-lg" />
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">Dashboard · Light</p>
          </FadeIn>
          <FadeIn delay={0.08} disabled={isMobile}>
            <div className="rounded-xl border border-border bg-card p-2 shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shots/analytics-dark.png" alt="Vance analytics, dark theme" className="w-full rounded-lg" />
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">Analytics · Dark</p>
          </FadeIn>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30 px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { icon: TrendingUp, value: '∞', label: 'Revenue tracked', tone: 'text-highlight' },
            { icon: Layers, value: '∞', label: 'Tasks organized', tone: 'text-primary' },
            { icon: Target, value: '100%', label: 'Deadline clarity', tone: 'text-highlight' },
            { icon: Clock, value: '0', label: 'Missed deadlines', tone: 'text-primary' },
          ].map(({ icon: Icon, value, label, tone }, i) => (
            <FadeIn key={label} delay={i * 0.08} className="flex flex-col items-center text-center" disabled={isMobile}>
              <Icon className={`mb-3 size-7 ${tone}`} />
              <div className={`font-heading text-4xl font-bold tracking-tight tabular-nums md:text-5xl ${tone}`}>{value}</div>
              <div className="mt-1.5 text-sm text-muted-foreground">{label}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA (loud, charcoal-black) ──────────────────────────────────── */}
      <section className="px-4 py-24 md:px-12 lg:px-20">
        <FadeIn disabled={isMobile}>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#0c0f13] px-6 py-20 text-center md:px-16 md:py-28">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{ background: 'radial-gradient(50% 60% at 50% 0%, rgba(255,158,32,0.16), transparent 70%)' }}
            />
            <div className="relative">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-highlight">Stop juggling tabs</p>
              <h2 className="font-heading font-black uppercase leading-[0.9] tracking-tighter text-white text-[clamp(2.75rem,9vw,7rem)]">
                Run it like<br />a studio<span className="text-highlight">.</span>
              </h2>
              <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                Organized projects, a schedule that builds itself, your people in one place, and real
                insight into where your time and money go.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={launchHref}
                  className="group inline-flex items-center gap-2 rounded-xl bg-highlight px-10 py-5 text-base font-bold uppercase tracking-wide text-highlight-foreground shadow-elevated transition-transform hover:-translate-y-1"
                >
                  Launch Vance <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="#what" className="rounded-xl border border-white/25 px-10 py-5 text-base font-semibold text-white transition-colors hover:bg-white/10">
                  See how it works
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-10 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <Wordmark />
            <span className="hidden text-border md:block">|</span>
            <span className="text-sm text-muted-foreground">Precision freelance operations</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/app" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
            <Link href="/projects" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Projects</Link>
            <Link href="/schedule" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Schedule</Link>
            <Link href="/contacts" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contacts</Link>
            <Link href="/analytics" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Analytics</Link>
          </div>
          <p className="text-xs text-muted-foreground/70">© 2026 Vance · by SolidPixel</p>
        </div>
      </footer>
    </div>
  )
}
