// ─── Vance domain model ────────────────────────────────────────────────────
// A freelancer manages Projects. Each Project embeds its Tasks and Changes
// arrays (mirroring the embed pattern used across the app), so a single
// document read returns everything needed to render a project detail view.

export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'cancelled'
export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type Priority = 'low' | 'medium' | 'high'
export type ChangeStatus = 'pending' | 'in-progress' | 'done'

export interface Task {
  _id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  /** Rough effort estimate, in hours. Drives the auto-scheduler's day packing. */
  estimatedHours?: number
  /** Hours actually logged once the task is worked / completed. */
  actualHours?: number
  /** Hard due date (ISO 'YYYY-MM-DD'). The scheduler never places a task past this. */
  deadline?: string
  /** Day the auto-scheduler (or the user) parked this task on. */
  scheduledDate?: string
  completed: boolean
  completedAt?: string | null
  order: number
  createdAt?: string
}

export interface Change {
  _id: string
  /** e.g. "Change 1", or a short title for the revision request. */
  title: string
  description?: string
  status: ChangeStatus
  /** Extra money this change is billed at (0 = absorbed / free revision). */
  amount?: number
  requestedAt?: string
  completed: boolean
  completedAt?: string | null
  order: number
}

/**
 * A person in the freelancer's world — a client, lead, collaborator, whoever.
 * Lives in its own `contacts` collection. `projectIds` softly associates the
 * contact with projects (the project documents are never modified).
 */
export interface Contact {
  _id: string
  name: string
  email?: string
  phone?: string
  company?: string
  /** Their title / role at the company. */
  role?: string
  location?: string
  linkedin?: string
  website?: string
  /** How you acquired / met them — Referral, Upwork, Direct, etc. (free text). */
  source?: string
  /** Preset (Great/Good/Neutral/Difficult/Bad) or any custom label. */
  relationship?: string
  description?: string
  color: string
  /** _ids of associated projects. */
  projectIds: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Project {
  _id: string
  name: string
  /** Project type — Website, Mobile App, Logo, API, etc. (free text). */
  type: string
  /** Skill areas the project spans — Frontend, Backend, Design, DevOps… */
  fields: string[]
  clientName: string
  /** Individual, Startup, Agency, Enterprise, Nonprofit… */
  clientType: string
  /** Where the lead came from — Upwork, Fiverr, Referral, Direct, LinkedIn… */
  source: string
  startedAt: string // ISO 'YYYY-MM-DD'
  deadline?: string // ISO 'YYYY-MM-DD'
  prodUrl?: string
  githubUrl?: string
  notes?: string
  /** Agreed project value (base, before changes). */
  amount: number
  currency: string
  /** Has the base amount been received. */
  paid?: boolean
  color: string
  status: ProjectStatus
  tasks: Task[]
  changes: Change[]
  additionalLinks?: { label: string; url: string }[]
  createdAt?: string
  updatedAt?: string
  completedAt?: string | null
}
