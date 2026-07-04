'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion'
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
  GitPullRequestArrow,
  Target,
} from 'lucide-react'

import { Logo } from '@/components/ui/logo'
import { DashboardMock } from '@/components/landing/dashboard-mock'

// ─── Types ────────────────────────────────────────────────────────────────────
type Kind = 'schedule' | 'projects' | 'analytics'
interface Screen {
  kind: Kind
  label: string
}

const screens: Record<string, Screen> = {
  schedule: { kind: 'schedule', label: 'vance.app/schedule' },
  projects: { kind: 'projects', label: 'vance.app/projects' },
  analytics: { kind: 'analytics', label: 'vance.app/analytics' },
}

// ─── App Window ───────────────────────────────────────────────────────────────
function AppWindow({
  screen,
  isDarkScreen,
}: {
  screen: Screen
  isDarkScreen: boolean
}) {
  return (
    <div className="w-full border-2 border-border bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-colors duration-500">
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/80 backdrop-blur-md border-b border-border shrink-0 transition-colors duration-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D4A017]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]" />
        </div>
        <div className="flex-1 mx-3 bg-background/60 border border-border px-3 py-1 flex items-center gap-2 transition-colors duration-500">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          <span className="text-[10px] font-mono text-muted-foreground truncate">{screen.label}</span>
        </div>
        <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider shrink-0 hidden sm:block">
          {isDarkScreen ? 'Dark Mode UI' : 'Light Mode UI'}
        </div>
      </div>

      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <motion.div
          key={isDarkScreen ? 'dark' : 'light'}
          initial={false}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          className="absolute inset-0"
        >
          <DashboardMock kind={screen.kind} isDark={isDarkScreen} />
        </motion.div>
      </div>
    </div>
  )
}

// ─── Fade In Section ──────────────────────────────────────────────────────────
function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  className = '',
  disabled = false,
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
      initial={{
        opacity: 0,
        y: direction === 'up' ? 36 : 0,
        x: direction === 'left' ? -36 : direction === 'right' ? 36 : 0,
        scale: 0.96,
        filter: 'blur(4px)',
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Parallax Window ─────────────────────────────────────────────────────────
function ParallaxWindow({ screen, isDarkScreen, flip = false, disabled = false }: { screen: Screen; isDarkScreen: boolean; flip?: boolean; disabled?: boolean }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])
  const rotate = useTransform(scrollYProgress, [0, 1], [1.5, -1.5])
  const springY = useSpring(y, { stiffness: 60, damping: 18 })
  const springRot = useSpring(rotate, { stiffness: 60, damping: 18 })

  if (disabled) return <AppWindow screen={screen} isDarkScreen={isDarkScreen} />

  return (
    <motion.div
      ref={ref}
      style={{ y: springY, rotate: springRot }}
      initial={{ opacity: 0, x: flip ? -80 : 80, scale: 0.75, filter: 'blur(15px)' }}
      whileInView={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <AppWindow screen={screen} isDarkScreen={isDarkScreen} />
    </motion.div>
  )
}

// ─── Feature Showcase ─────────────────────────────────────────────────────────
function Feature({
  tag, title, description, bullets, screen, accent, flip, isDarkScreen, isMobile
}: {
  tag: string; title: string; description: string; bullets: string[]
  screen: Screen; accent: string; flip?: boolean; isDarkScreen: boolean; isMobile: boolean
}) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${flip ? 'lg:grid-flow-dense' : ''}`}>
      <FadeIn direction={flip ? 'right' : 'left'} className={flip ? 'lg:col-start-2' : ''} disabled={isMobile}>
        <div className="space-y-7">
          <div className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border-2" style={{ borderColor: accent, color: accent }}>
            {tag}
          </div>
          <h3 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] whitespace-pre-line text-foreground">{title}</h3>
          <p className="text-muted-foreground font-mono text-sm leading-relaxed">{description}</p>
          <ul className="space-y-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold uppercase tracking-wide text-foreground">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: accent }} />
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

// ─── Main Page ────────────────────────────────────────────────────────────────
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

  // Invert mock UI relative to global theme:
  // Global Dark Mode -> show Light UI; Global Light Mode -> show Dark UI.
  const isGlobalDark = theme === 'dark'
  const isDarkScreen = mounted ? !isGlobalDark : true

  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(heroScroll, [0, 1], [0, 150])
  const heroOpacity = useTransform(heroScroll, [0, 0.65], [1, 0])
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.85])

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden transition-colors duration-500 selection:bg-primary selection:text-primary-foreground">

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-500">
        <div className="flex items-center gap-3">
          <Logo className="text-xl md:text-2xl text-foreground" />
          <span className="hidden sm:block text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
            Precision Freelance Ops
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/projects" className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Projects
            </Link>
            <Link href="/schedule" className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Schedule
            </Link>
            <Link href="/analytics" className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Analytics
            </Link>
          </div>
          <button
            onClick={() => setTheme(isGlobalDark ? 'light' : 'dark')}
            className="flex items-center gap-2 px-3 py-2 border border-border hover:border-foreground text-muted-foreground hover:text-foreground transition-all text-[10px] font-mono uppercase tracking-widest bg-card"
            title="Toggle app theme"
          >
            {mounted && isGlobalDark ? <><Sun size={12} /> <span className="hidden md:inline">Light</span></> : <><Moon size={12} /> <span className="hidden md:inline">Dark</span></>}
          </button>
          <Link
            href={isLoggedIn ? "/schedule" : "/login"}
            className="flex items-center gap-2 px-4 md:px-5 py-2 border-2 border-foreground bg-foreground text-background text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-background hover:text-foreground transition-all duration-200"
          >
            Launch <span className="hidden sm:inline">App</span> <ArrowRight size={12} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Fine grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="absolute top-0 w-px h-full bg-gradient-to-b from-transparent via-foreground/[0.07] to-transparent" style={{ right: '12%' }} />
        <div className="absolute top-0 w-px h-full bg-gradient-to-b from-transparent via-foreground/[0.07] to-transparent" style={{ left: '12%' }} />

        <motion.div
          style={isMobile ? {} : { y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center w-full flex flex-col items-center gap-8 max-w-5xl mx-auto"
        >
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.6em' }}
            animate={{ opacity: 1, letterSpacing: '0.35em' }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="text-[10px] font-space-grotesk text-muted-foreground uppercase tracking-[0.35em]"
          >
            Precision Freelance Infrastructure
          </motion.p>

          {/* Clip-path word reveal */}
          <div className="flex gap-[0.14em] overflow-hidden">
            {['VAN', 'CE'].map((word, i) => (
              <motion.h1
                key={word}
                initial={isMobile ? false : { clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.3 + i * 0.2 }}
                className="text-[clamp(72px,14vw,200px)] font-space-grotesk font-black uppercase tracking-tighter leading-[0.82] text-foreground"
              >
                {word}
              </motion.h1>
            ))}
          </div>

          {/* Subhead */}
          <motion.div
            initial={isMobile ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.85 }}
            className="space-y-2 max-w-lg mx-auto"
          >
            <p className="font-mono text-sm md:text-base uppercase tracking-[0.2em] text-foreground">
              The ruthless command center for high-volume freelancers.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground leading-relaxed">
              Zero confusion. Complete visibility. Every project, every task, every deadline.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={isMobile ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 1.05 }}
          >
            <Link
              href={isLoggedIn ? '/schedule' : '/login'}
              className="group inline-flex items-center gap-4 px-8 py-4 bg-foreground text-background font-black uppercase text-xs tracking-[0.2em] border-2 border-foreground shadow-[5px_5px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] transition-all duration-150"
            >
              Initialize Engine
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────────────── */}
      <div className="border-y border-border py-5 bg-card/50 overflow-hidden backdrop-blur-sm">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          className="flex items-center gap-0 w-max"
        >
          {[0, 1].map((arrayIndex) => (
            <div key={arrayIndex} className="flex items-center">
              {['Auto-Scheduled Tasks', 'Deadline Tracking', 'Revenue Analytics', 'Change Requests', 'Client Pipeline', 'Field Breakdown', 'Dark & Light Mode', 'Real-Time Updates'].map((item, i) => (
                <div key={i} className="flex items-center">
                  <span className="shrink-0 px-10 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">{item}</span>
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-border" />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── FEATURE CARDS ────────────────────────────────────────────────── */}
      <section id="features" className="px-6 md:px-12 lg:px-24 py-32 relative">
        <FadeIn className="mb-16 text-center" disabled={isMobile}>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">Platform Modules</p>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-foreground">
            Everything you<br />
            <span className="text-transparent" style={{ WebkitTextStroke: mounted && isGlobalDark ? '1.5px white' : '1.5px black' }}>need to ship</span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10">
          {[
            { icon: FolderKanban, title: 'Projects', tag: 'Core Module', desc: 'Every client engagement in one place — type, fields, source, money, links, tasks and change requests. Full CRUD, zero spreadsheets.', accent: '#3b82f6' },
            { icon: CalendarRange, title: 'Scheduler', tag: 'Automation Layer', desc: 'Drop in tasks with estimates and deadlines. Vance packs them into a day-by-day plan automatically and flags anything at risk.', accent: '#10b981' },
            { icon: BarChart3, title: 'Analytics', tag: 'Intelligence Layer', desc: 'Revenue earned and pending, time per project, the fields you work in most, and how many changes each client demands.', accent: '#f59e0b' },
          ].map(({ icon: Icon, title, tag, desc, accent }, i) => (
            <FadeIn key={title} delay={i * 0.1} disabled={isMobile}>
              <div className="group p-8 border-2 border-border bg-card/80 backdrop-blur-sm hover:border-foreground hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)] transition-all duration-300 h-full flex flex-col">
                <div className="mb-6 flex items-start justify-between">
                  <div className="p-3 border border-border" style={{ borderLeft: `3px solid ${accent}` }}>
                    <Icon size={22} style={{ color: accent }} />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">{tag}</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-3 text-foreground">{title}</h3>
                <p className="text-muted-foreground font-mono text-xs leading-relaxed flex-1">{desc}</p>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="w-8 h-0.5" style={{ backgroundColor: accent }} />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── BUILT FOR SOLO OPERATORS ─────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-24 py-32 bg-muted/20 border-b border-border">
        <FadeIn className="mb-16 text-center" disabled={isMobile}>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">Built Around You</p>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-foreground">
            Built for<br />
            <span className="text-transparent" style={{ WebkitTextStroke: mounted && isGlobalDark ? '1.5px white' : '1.5px black' }}>Solo Operators</span>
          </h2>
          <p className="mt-6 text-muted-foreground font-mono text-sm max-w-xl mx-auto leading-relaxed uppercase tracking-wide">
            No team, no overhead. Plan, schedule, bill and analyze every engagement from a single command center.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FadeIn delay={0.1} disabled={isMobile}>
            <div className="group p-8 border-2 border-border bg-card hover:border-foreground hover:-translate-y-2 transition-all duration-300 flex flex-col gap-6 h-full">
              <div className="flex items-start justify-between">
                <div className="p-3 border border-border" style={{ borderLeft: '3px solid #10b981' }}>
                  <CalendarRange size={22} style={{ color: '#10b981' }} />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Automation</span>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Auto-Schedule Engine</h3>
                <p className="text-muted-foreground font-mono text-xs leading-relaxed">
                  Every incomplete task across your live projects, sorted by deadline and priority, then packed into your working days automatically — so you always know what to do next.
                </p>
              </div>
              <ul className="space-y-2">
                {['Deadline-aware day packing', 'Configurable daily-hour budget', 'Overdue & at-risk flagging', 'Daily and weekly horizons'].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] font-black uppercase tracking-wide text-foreground">
                    <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-foreground" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/schedule"
                className="group/btn mt-auto flex items-center justify-between px-4 py-3 border-2 border-foreground bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-background hover:text-foreground transition-all"
              >
                Open Scheduler <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.15} disabled={isMobile}>
            <div className="group p-8 border-2 border-border bg-card hover:border-foreground hover:-translate-y-2 transition-all duration-300 flex flex-col gap-6 h-full">
              <div className="flex items-start justify-between">
                <div className="p-3 border border-border" style={{ borderLeft: '3px solid #f59e0b' }}>
                  <Wallet size={22} style={{ color: '#f59e0b' }} />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Revenue</span>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Money & Changes</h3>
                <p className="text-muted-foreground font-mono text-xs leading-relaxed">
                  Track agreed value, mark payments, and bill every revision. Change requests carry their own status and extra charge, so scope creep never goes unpaid.
                </p>
              </div>
              <ul className="space-y-2">
                {['Base value + change billing', 'Paid / unpaid tracking', 'Per-client change history', 'Pending revenue at a glance'].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] font-black uppercase tracking-wide text-foreground">
                    <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-foreground" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/projects"
                className="group/btn mt-auto flex items-center justify-between px-4 py-3 border-2 border-foreground bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-background hover:text-foreground transition-all"
              >
                Open Projects <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FEATURE SHOWCASES ────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-24 py-8 pt-32 space-y-40">
        <Feature
          tag="01 — Projects"
          title={`Every\nProject\nTracked`}
          description="Each engagement end to end — client and client type, lead source, the fields it spans, production and GitHub URLs, money agreed, and every task and revision in between."
          bullets={['Full CRUD on projects, tasks & changes', 'Active, on-hold, completed & cancelled states', 'Prod URL, GitHub, money & notes', 'Per-project task and revision history']}
          screen={screens.projects}
          accent="#3b82f6"
          isDarkScreen={isDarkScreen}
          isMobile={isMobile}
        />
        <Feature
          tag="02 — Scheduler"
          title={`Tasks That\nSchedule\nThemselves`}
          description="Give each task an estimate, a priority and a deadline. Vance sorts by urgency and packs them into your working days, so you always know exactly what to do next — and what's about to slip."
          bullets={['Automatic deadline-aware day packing', 'Configurable daily working-hour budget', 'At-risk & overdue task flagging', 'Daily and weekly timeline views']}
          screen={screens.schedule}
          accent="#10b981"
          flip
          isDarkScreen={isDarkScreen}
          isMobile={isMobile}
        />
      </section>

      {/* ── SCREENSHOT GALLERY ────────────────────────────────────────────── */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-muted/30 border-y border-border">
        <FadeIn className="mb-16" disabled={isMobile}>
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">Gallery</p>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-foreground">
                Every View.<br />
                <span className="text-transparent" style={{ WebkitTextStroke: mounted && isGlobalDark ? '1.5px white' : '1.5px black' }}>
                  Dark & Light UI
                </span>
              </h2>
            </div>
            <p className="text-muted-foreground font-mono text-xs max-w-xs leading-relaxed uppercase tracking-wide">
              The UI perfectly adapts to match the inverse of your current theme. Toggle the app theme above.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { screen: screens.analytics, label: 'Analytics Center' },
            { screen: screens.schedule, label: 'Auto Schedule' },
          ].map(({ screen, label }, i) => (
            <FadeIn key={label} delay={i * 0.1} disabled={isMobile}>
              <div className="space-y-3 group">
                <div className="transition-transform duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2">
                  <AppWindow screen={screen} isDarkScreen={isDarkScreen} />
                </div>
                <p className="text-center text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 lg:px-20 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
          {[
            { icon: TrendingUp, value: '∞', label: 'Revenue Tracked', accent: '#10b981' },
            { icon: Layers, value: '∞', label: 'Tasks Organized', accent: '#3b82f6' },
            { icon: Target, value: '100%', label: 'Deadline Clarity', accent: '#f59e0b' },
            { icon: Clock, value: '0', label: 'Missed Deadlines', accent: '#ef4444' },
          ].map(({ icon: Icon, value, label, accent }, i) => (
            <FadeIn key={label} delay={i * 0.1} className="flex flex-col items-center justify-center text-center px-20 py-5" disabled={isMobile}>
              <div className="flex justify-center mb-4"><Icon size={34} style={{ color: accent }} /></div>
              <div className="text-6xl md:text-7xl font-black tracking-tighter mb-2" style={{ color: accent }}>{value}</div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{label}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-24 py-40 text-center relative overflow-hidden bg-foreground text-background texture-grid-me">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(var(--background) 1px, transparent 1px), linear-gradient(90deg, var(--background) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <FadeIn disabled={isMobile} className="relative z-10 flex flex-col items-center">
          <p className="text-xs font-mono text-background/60 uppercase tracking-[0.3em] mb-6">Ready to start?</p>
          <h2 className="text-5xl md:text-8xl xl:text-[230px] font-black uppercase tracking-tighter leading-none">
            Take Control<br />
            <span className="text-background" style={{ WebkitTextStroke: '2px var(--background)' }}>Start Today</span>
          </h2>
          <p className="mt-8 text-background/80 font-mono text-sm max-w-lg mx-auto mb-12 leading-relaxed">
            Gain a tactical edge with organized projects, self-arranging schedules, and real insight into where your time and money go.
          </p>
          <Link
            href={isLoggedIn ? "/schedule" : "/login"}
            className="group relative z-20 inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-background text-foreground font-black uppercase text-xs md:text-sm tracking-widest border-2 border-background shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] md:hover:translate-x-[8px] md:hover:translate-y-[8px] transition-all"
          >
            Launch Vance
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </FadeIn>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 md:px-12 lg:px-24 py-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
          <Logo />
          <span className="hidden md:block text-border">|</span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-center md:text-left">Precision Freelance Ops</span>
        </div>
        <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-4">
          <Link href="/app" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">Dashboard</Link>
          <Link href="/projects" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">Projects</Link>
          <Link href="/schedule" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">Schedule</Link>
          <Link href="/analytics" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">Analytics</Link>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Freelance Command Center</p>
          <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">© 2026 VANCE ENGINE</p>
        </div>
      </footer>
    </div>
  )
}
