'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import {
  CalendarRange,
  BarChart3,
  FolderKanban,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
  Wallet,
  Target,
} from '@/components/ui/icons'
import { DashboardMock } from '@/components/landing/dashboard-mock'
import { ShaderHero } from '@/components/landing/shader-hero'

// ─── Types ──────────────────────────────────────────────────────────────────
type Kind = 'schedule' | 'projects' | 'analytics'
interface Screen { kind: Kind; label: string }

const screens: Record<string, Screen> = {
  schedule: { kind: 'schedule', label: 'vance.app/schedule' },
  projects: { kind: 'projects', label: 'vance.app/projects' },
  analytics: { kind: 'analytics', label: 'vance.app/analytics' },
}

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

// ─── App window (product screenshot chrome) ───────────────────────────────────
function AppWindow({ screen, isDarkScreen }: { screen: Screen; isDarkScreen: boolean }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
      <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#FF5F56]" />
          <span className="size-3 rounded-full bg-[#FEBC2E]" />
          <span className="size-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="mx-2 flex flex-1 items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-1">
          <span className="size-1.5 shrink-0 rounded-full bg-success" />
          <span className="truncate font-mono text-[10px] text-muted-foreground">{screen.label}</span>
        </div>
        <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:block">
          {isDarkScreen ? 'Dark UI' : 'Light UI'}
        </span>
      </div>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <motion.div key={isDarkScreen ? 'dark' : 'light'} initial={false} animate={{ opacity: 1 }} className="absolute inset-0">
          <DashboardMock kind={screen.kind} isDark={isDarkScreen} />
        </motion.div>
      </div>
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

// ─── Parallax product window ─────────────────────────────────────────────────
function ParallaxWindow({ screen, isDarkScreen, flip = false, disabled = false }: { screen: Screen; isDarkScreen: boolean; flip?: boolean; disabled?: boolean }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [30, -30])
  const springY = useSpring(y, { stiffness: 60, damping: 18 })

  if (disabled) return <AppWindow screen={screen} isDarkScreen={isDarkScreen} />
  return (
    <motion.div
      ref={ref}
      style={{ y: springY }}
      initial={{ opacity: 0, x: flip ? -48 : 48, scale: 0.92 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <AppWindow screen={screen} isDarkScreen={isDarkScreen} />
    </motion.div>
  )
}

// ─── Feature showcase row ─────────────────────────────────────────────────────
function Feature({
  tag, title, description, bullets, screen, tone, flip, isDarkScreen, isMobile,
}: {
  tag: string; title: string; description: string; bullets: string[]
  screen: Screen; tone: 'primary' | 'highlight'; flip?: boolean; isDarkScreen: boolean; isMobile: boolean
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
      <div className={flip ? 'lg:col-start-1 lg:row-start-1' : ''}>
        <ParallaxWindow screen={screen} isDarkScreen={isDarkScreen} flip={flip} disabled={isMobile} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsLoggedIn(document.cookie.includes('is_logged_in=true'))
    setIsMobile(window.innerWidth < 768)
  }, [])

  const isGlobalDark = theme === 'dark'
  const isDarkScreen = mounted ? !isGlobalDark : true
  const launchHref = isLoggedIn ? '/schedule' : '/login'

  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(heroScroll, [0, 1], [0, 120])
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0])

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 md:px-10">
          <Wordmark />
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-6 md:flex">
              <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</Link>
              <Link href="/schedule" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Schedule</Link>
              <Link href="/analytics" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Analytics</Link>
            </div>
            <button
              onClick={() => setTheme(isGlobalDark ? 'light' : 'dark')}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative flex h-screen min-h-[560px] flex-col items-center justify-center overflow-hidden px-6">
        {/* Animated "halo" shader background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[#0a1417]" />
          <ShaderHero />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-background" />
        </div>

        <motion.div
          style={isMobile ? {} : { y: heroY, opacity: heroOpacity }}
          className="relative z-10 flex w-full flex-col items-center text-center"
        >
          <h1 className="font-heading font-bold leading-none tracking-tighter text-white text-[clamp(4.5rem,20vw,17rem)] [text-shadow:0_4px_60px_rgba(0,0,0,0.45)]">
            VANCE<span className="text-highlight">.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Manage every client project, let your tasks schedule themselves, and keep revenue, time and change requests in view — all in one calm, professional workspace built for high-volume freelancers.
          </p>
          <Link
            href={launchHref}
            className="group mt-9 inline-flex items-center gap-2 rounded-lg bg-highlight px-8 py-3.5 text-sm font-semibold text-highlight-foreground shadow-elevated transition-transform hover:-translate-y-0.5"
          >
            {isLoggedIn ? 'Initialize' : 'Get started'}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </section>

      {/* ── TICKER ──────────────────────────────────────────────────────── */}
      <div className="overflow-hidden border-y border-border bg-card/60 py-4">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
          className="flex w-max items-center"
        >
          {[0, 1].map(idx => (
            <div key={idx} className="flex items-center">
              {['Auto-scheduled tasks', 'Deadline tracking', 'Revenue analytics', 'Change requests', 'Client pipeline', 'Field breakdown', 'Dark & light mode', 'Real-time updates'].map((item, i) => (
                <div key={i} className="flex items-center">
                  <span className="whitespace-nowrap px-8 text-sm font-medium text-muted-foreground">{item}</span>
                  <span className="size-1.5 shrink-0 rounded-full bg-highlight/70" />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24 md:px-12 lg:px-20">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center" disabled={isMobile}>
          <p className="mb-3 text-sm font-semibold text-primary">Platform modules</p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">Everything you need to ship</h2>
          <p className="mt-4 text-base text-muted-foreground">Three tightly-integrated modules that replace the spreadsheet sprawl of running a freelance practice.</p>
        </FadeIn>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { icon: FolderKanban, title: 'Projects', tag: 'Core', tone: 'primary', desc: 'Every client engagement in one place — type, fields, source, money, links, tasks and change requests. Full CRUD, zero spreadsheets.' },
            { icon: CalendarRange, title: 'Scheduler', tag: 'Automation', tone: 'highlight', desc: 'Drop in tasks with estimates and deadlines. Vance packs them into a day-by-day plan automatically and flags anything at risk.' },
            { icon: BarChart3, title: 'Analytics', tag: 'Intelligence', tone: 'primary', desc: 'Revenue earned and pending, time per project, the fields you work in most, and how many changes each client demands.' },
          ].map(({ icon: Icon, title, tag, tone, desc }, i) => {
            const chip = tone === 'primary' ? 'bg-primary/10 text-primary' : 'bg-highlight/15 text-highlight'
            return (
              <FadeIn key={title} delay={i * 0.08} disabled={isMobile}>
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

      {/* ── SHOWCASES ───────────────────────────────────────────────────── */}
      <section className="space-y-28 bg-muted/30 px-6 py-24 md:px-12 lg:px-20">
        <Feature
          tag="Projects"
          title={'Every project,\ntracked end to end'}
          description="Each engagement in full — client and client type, lead source, the fields it spans, production and GitHub URLs, money agreed, and every task and revision in between."
          bullets={['Full CRUD on projects, tasks & changes', 'Active, on-hold, completed & cancelled states', 'Prod URL, GitHub, money & notes', 'Per-project task and revision history']}
          screen={screens.projects}
          tone="primary"
          isDarkScreen={isDarkScreen}
          isMobile={isMobile}
        />
        <Feature
          tag="Scheduler"
          title={'Tasks that\nschedule themselves'}
          description="Give each task an estimate, a priority and a deadline. Vance sorts by urgency and packs them into your working days — so you always know exactly what to do next, and what's about to slip."
          bullets={['Automatic deadline-aware day packing', 'Configurable daily working-hour budget', 'At-risk & overdue task flagging', 'Daily and weekly timeline views']}
          screen={screens.schedule}
          tone="highlight"
          flip
          isDarkScreen={isDarkScreen}
          isMobile={isMobile}
        />
      </section>

      {/* ── GALLERY ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 md:px-12 lg:px-20">
        <FadeIn className="mx-auto mb-12 max-w-2xl text-center" disabled={isMobile}>
          <p className="mb-3 text-sm font-semibold text-primary">Gallery</p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">Beautiful in dark &amp; light</h2>
          <p className="mt-4 text-base text-muted-foreground">The interface adapts to the inverse of your current theme — toggle it up top to preview both.</p>
        </FadeIn>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {[
            { screen: screens.analytics, label: 'Analytics' },
            { screen: screens.schedule, label: 'Auto schedule' },
          ].map(({ screen, label }, i) => (
            <FadeIn key={label} delay={i * 0.08} disabled={isMobile}>
              <div className="group space-y-3">
                <div className="transition-transform duration-500 group-hover:-translate-y-1.5">
                  <AppWindow screen={screen} isDarkScreen={isDarkScreen} />
                </div>
                <p className="text-center text-sm text-muted-foreground">{label}</p>
              </div>
            </FadeIn>
          ))}
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

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 md:px-12 lg:px-20">
        <FadeIn disabled={isMobile}>
          <div className="mx-auto max-w-5xl rounded-3xl bg-primary px-8 py-16 text-center md:px-16 md:py-20">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-white md:text-5xl">Take control of your practice</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/75">
              Organized projects, a schedule that builds itself, and real insight into where your time and money go.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={launchHref}
                className="group inline-flex items-center gap-2 rounded-lg bg-highlight px-7 py-3 text-sm font-semibold text-highlight-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Launch Vance <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="#features" className="rounded-lg border border-white/25 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10">
                See how it works
              </Link>
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
            <Link href="/analytics" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Analytics</Link>
          </div>
          <p className="text-xs text-muted-foreground/70">© 2026 Vance</p>
        </div>
      </footer>
    </div>
  )
}
