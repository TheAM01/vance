// Seed Vance with realistic dummy projects so you can learn the app.
// Run with:  node --env-file=.env.local scripts/seed.mjs
// Re-running is safe — it removes previously-seeded demo projects first.

import { MongoClient } from 'mongodb'
import { randomUUID } from 'crypto'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/seed.mjs')
  process.exit(1)
}

// 'YYYY-MM-DD' n days from today (local time).
function dayOffset(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${da}`
}
const nowIso = () => new Date().toISOString()

// Build a task from a short spec.
function task(spec, order) {
  const done = !!spec.done
  return {
    _id: randomUUID(),
    title: spec.title,
    description: spec.desc || '',
    status: done ? 'done' : (spec.status || 'todo'),
    priority: spec.priority || 'medium',
    estimatedHours: spec.hours ?? 1,
    actualHours: done ? (spec.hours ?? 1) : 0,
    deadline: spec.deadline || '',
    scheduledDate: '',
    completed: done,
    completedAt: done ? nowIso() : null,
    order,
    createdAt: nowIso(),
  }
}
function change(spec, order) {
  const done = spec.status === 'done'
  return {
    _id: randomUUID(),
    title: spec.title,
    description: spec.desc || '',
    status: spec.status || 'pending',
    amount: spec.amount ?? 0,
    requestedAt: spec.requestedAt || dayOffset(-3),
    completed: done,
    completedAt: done ? nowIso() : null,
    order,
  }
}
function project(p) {
  return {
    name: p.name,
    type: p.type,
    fields: p.fields,
    clientName: p.clientName,
    clientType: p.clientType,
    source: p.source,
    startedAt: p.startedAt,
    deadline: p.deadline || '',
    prodUrl: p.prodUrl || '',
    githubUrl: p.githubUrl || '',
    notes: p.notes || '',
    amount: p.amount,
    currency: '$',
    paid: !!p.paid,
    color: p.color,
    status: p.status,
    tasks: (p.tasks || []).map(task),
    changes: (p.changes || []).map(change),
    additionalLinks: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    completedAt: p.status === 'completed' ? nowIso() : null,
    seed: true,
  }
}

const projects = [
  project({
    name: 'Acme Store', type: 'E-commerce', fields: ['Frontend', 'Stripe', 'Next.js'],
    clientName: 'Acme Inc', clientType: 'Agency', source: 'Upwork',
    startedAt: dayOffset(-18), deadline: dayOffset(12), amount: 4200, paid: false, color: '#2563eb',
    status: 'active', prodUrl: 'https://acme-store.example.com', githubUrl: 'https://github.com/you/acme-store',
    notes: 'Headless storefront on Next.js + Stripe. Client wants Apple Pay before launch.',
    tasks: [
      { title: 'Set up project & repo', hours: 2, priority: 'high', done: true },
      { title: 'Cart & checkout flow', hours: 3, priority: 'high', deadline: dayOffset(1), desc: 'Cart drawer, line items, totals.' },
      { title: 'Stripe webhooks', hours: 3, priority: 'high', deadline: dayOffset(3) },
      { title: 'Product filters & search', hours: 2, priority: 'medium', deadline: dayOffset(5) },
      { title: 'Order confirmation emails', hours: 2, priority: 'medium', deadline: dayOffset(6) },
      { title: 'Wishlist feature', hours: 2, priority: 'low', deadline: dayOffset(9) },
    ],
    changes: [
      { title: 'Change 1 — Add Apple Pay', amount: 300, status: 'pending', desc: 'Wallet button on checkout.' },
      { title: 'Change 2 — Tweak hero copy', amount: 0, status: 'done' },
    ],
  }),
  project({
    name: 'Folio Portfolio', type: 'Website', fields: ['Design', 'Next.js'],
    clientName: 'Jordan Rivera', clientType: 'Individual', source: 'Referral',
    startedAt: dayOffset(-10), deadline: dayOffset(8), amount: 1800, paid: false, color: '#16a34a',
    status: 'active', notes: 'Personal portfolio for a motion designer. Heavy on animation.',
    tasks: [
      { title: 'Wireframes & moodboard', hours: 2, priority: 'medium', done: true },
      { title: 'Hero animation pass', hours: 1.5, priority: 'medium', deadline: dayOffset(1) },
      { title: 'Case study pages', hours: 3, priority: 'medium', deadline: dayOffset(4) },
      { title: 'Deploy + QA', hours: 1.5, priority: 'low', deadline: dayOffset(7) },
    ],
    changes: [
      { title: 'Change 1 — Swap display font', amount: 0, status: 'done' },
    ],
  }),
  project({
    name: 'CRM Lite', type: 'Web App', fields: ['Fullstack', 'Backend'],
    clientName: 'Northwind', clientType: 'Startup', source: 'Direct',
    startedAt: dayOffset(-22), deadline: dayOffset(20), amount: 6500, paid: false, color: '#f59e0b',
    status: 'active', githubUrl: 'https://github.com/you/crm-lite',
    notes: 'Lightweight CRM. Contacts, deals, simple pipeline. Postgres + Next.',
    tasks: [
      { title: 'Bugfix: timezone offset on deals', hours: 1, priority: 'high', deadline: dayOffset(-1), desc: 'Dates shift a day in PST.' },
      { title: 'Auth + sessions', hours: 2.5, priority: 'high', deadline: dayOffset(2) },
      { title: 'Dashboard widgets', hours: 1.5, priority: 'medium', deadline: dayOffset(3) },
      { title: 'Contacts CRUD', hours: 3, priority: 'medium', deadline: dayOffset(5) },
      { title: 'Email integration', hours: 4, priority: 'low', deadline: dayOffset(12) },
    ],
    changes: [
      { title: 'Change 1 — Add CSV export', amount: 250, status: 'in-progress' },
    ],
  }),
  project({
    name: 'Nimbus Landing', type: 'Landing Page', fields: ['Frontend', 'Copywriting'],
    clientName: 'Nimbus', clientType: 'Startup', source: 'LinkedIn',
    startedAt: dayOffset(-6), deadline: dayOffset(15), amount: 2400, paid: false, color: '#9333ea',
    status: 'on-hold', notes: 'Paused — waiting on final copy and brand assets from client.',
    tasks: [
      { title: 'Landing copy review', hours: 2, priority: 'medium', deadline: dayOffset(8) },
      { title: 'Pricing section', hours: 2, priority: 'low', deadline: dayOffset(10) },
    ],
    changes: [],
  }),
  project({
    name: 'Mainframe API', type: 'API / Backend', fields: ['Backend', 'AWS'],
    clientName: 'Volt Systems', clientType: 'Enterprise', source: 'Referral',
    startedAt: dayOffset(-60), deadline: dayOffset(-5), amount: 9000, paid: true, color: '#dc2626',
    status: 'completed', githubUrl: 'https://github.com/you/mainframe-api',
    notes: 'Delivered & paid. Node service on AWS Lambda + API Gateway.',
    tasks: [
      { title: 'Schema & migrations', hours: 4, priority: 'high', done: true },
      { title: 'Auth & rate limiting', hours: 3, priority: 'high', done: true },
      { title: 'Endpoints + tests', hours: 6, priority: 'medium', done: true },
      { title: 'Deploy to AWS', hours: 2, priority: 'medium', done: true },
    ],
    changes: [
      { title: 'Change 1 — Add rate limiting tier', amount: 500, status: 'done' },
    ],
  }),
  project({
    name: 'Bistro Site', type: 'Website', fields: ['Webflow', 'SEO'],
    clientName: 'Bistro Nine', clientType: 'Individual', source: 'Fiverr',
    startedAt: dayOffset(-4), deadline: dayOffset(14), amount: 1200, paid: false, color: '#0891b2',
    status: 'active', notes: 'Small restaurant site. Menu, hours, reservations link.',
    tasks: [
      { title: 'Menu page', hours: 2, priority: 'medium', deadline: dayOffset(2) },
      { title: 'Google Maps embed', hours: 1, priority: 'low', deadline: dayOffset(4) },
      { title: 'SEO meta tags', hours: 1.5, priority: 'low', deadline: dayOffset(6) },
    ],
    changes: [],
  }),
]

const client = new MongoClient(uri)
try {
  await client.connect()
  const db = client.db('vance')
  const col = db.collection('projects')
  const removed = await col.deleteMany({ seed: true })
  const res = await col.insertMany(projects)
  console.log(`Removed ${removed.deletedCount} old demo project(s).`)
  console.log(`Inserted ${res.insertedCount} demo project(s):`)
  for (const p of projects) console.log(`  • ${p.name} (${p.status}) — ${p.tasks.length} tasks, ${p.changes.length} changes`)
} catch (err) {
  console.error('Seed failed:', err.message)
  process.exit(1)
} finally {
  await client.close()
}
