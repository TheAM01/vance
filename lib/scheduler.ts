import { Project, Task, Priority } from './types'
import { parseDateLocal, startOfDay, toLocalDateStr } from './date-utils'

// ─── Auto-scheduler ─────────────────────────────────────────────────────────
// Takes every incomplete task across the freelancer's live projects and lays
// them out, day by day, starting today. Tasks are ordered by deadline urgency
// then priority, then greedily packed into days up to a daily hour capacity.
// The result is a deterministic "what should I work on, and when" plan.

export interface ScheduledTask {
  task: Task
  projectId: string
  projectName: string
  projectColor: string
  /** Day this task is slotted on — 'YYYY-MM-DD'. */
  date: string
  /** Deadline is already in the past. */
  overdue: boolean
  /** The day we could fit it is later than its deadline — capacity at risk. */
  atRisk: boolean
  /** Task is already completed — kept in the plan, shown dimmed, on its finish day. */
  done: boolean
}

export interface ScheduleOptions {
  /** Working-hours budget per day. Defaults to 6. */
  hoursPerDay?: number
  startDate?: Date
}

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

export function buildSchedule(projects: Project[], opts: ScheduleOptions = {}): ScheduledTask[] {
  const hoursPerDay = Math.max(1, opts.hoursPerDay ?? 6)
  const today = startOfDay(opts.startDate ?? new Date())
  const todayStr = toLocalDateStr(today)

  type Item = { task: Task; projectId: string; projectName: string; projectColor: string }
  const pending: Item[] = []
  const finished: Item[] = []

  for (const p of projects) {
    // Only active projects are scheduled. On-hold is paused; completed/cancelled are done.
    if (p.status !== 'active') continue
    for (const t of p.tasks || []) {
      const ref: Item = { task: t, projectId: p._id, projectName: p.name, projectColor: p.color }
      if (t.completed || t.status === 'done') finished.push(ref)
      else pending.push(ref)
    }
  }

  // Most urgent first: earliest deadline → highest priority → manual order.
  pending.sort((a, b) => {
    const da = a.task.deadline ? parseDateLocal(a.task.deadline).getTime() : Infinity
    const db = b.task.deadline ? parseDateLocal(b.task.deadline).getTime() : Infinity
    if (da !== db) return da - db
    const pa = PRIORITY_WEIGHT[a.task.priority] ?? 1
    const pb = PRIORITY_WEIGHT[b.task.priority] ?? 1
    if (pa !== pb) return pa - pb
    return (a.task.order ?? 0) - (b.task.order ?? 0)
  })

  const dayLoads: Record<string, number> = {}
  const result: ScheduledTask[] = []

  for (const item of pending) {
    const est = Math.max(0.5, item.task.estimatedHours || 1)

    // Earliest day (from today) that still has room. A single oversized task
    // is allowed to land on an otherwise-empty day rather than never fitting.
    const d = new Date(today)
    let dayStr = toLocalDateStr(d)
    while ((dayLoads[dayStr] || 0) + est > hoursPerDay && (dayLoads[dayStr] || 0) > 0) {
      d.setDate(d.getDate() + 1)
      dayStr = toLocalDateStr(d)
    }
    dayLoads[dayStr] = (dayLoads[dayStr] || 0) + est

    const deadline = item.task.deadline ? parseDateLocal(item.task.deadline) : null
    const slotted = parseDateLocal(dayStr)

    result.push({
      task: item.task,
      projectId: item.projectId,
      projectName: item.projectName,
      projectColor: item.projectColor,
      date: dayStr,
      overdue: !!deadline && deadline < today,
      atRisk: !!deadline && slotted > deadline,
      done: false,
    })
  }

  // Completed tasks stay visible on the day they were finished (today as a
  // fallback) so the schedule shows progress rather than items vanishing.
  for (const item of finished) {
    const ca = item.task.completedAt
    const dayStr = ca ? toLocalDateStr(new Date(ca)) : todayStr
    result.push({
      task: item.task,
      projectId: item.projectId,
      projectName: item.projectName,
      projectColor: item.projectColor,
      date: dayStr,
      overdue: false,
      atRisk: false,
      done: true,
    })
  }

  return result
}

/** Group a flat schedule into an ordered map keyed by 'YYYY-MM-DD'. */
export function groupByDay(scheduled: ScheduledTask[]): Map<string, ScheduledTask[]> {
  const map = new Map<string, ScheduledTask[]>()
  for (const s of scheduled) {
    if (!map.has(s.date)) map.set(s.date, [])
    map.get(s.date)!.push(s)
  }
  return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])))
}
