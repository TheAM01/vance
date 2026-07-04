/**
 * Parse a date string into local { year, month, day } without timezone shifting.
 * new Date('YYYY-MM-DD') produces UTC midnight, which can shift the day in local time.
 */
export function getLocalDateParts(dateStr: string) {
    if (dateStr.includes('T')) {
        const d = new Date(dateStr)
        return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() }
    }
    const [y, m, d] = dateStr.split('-').map(Number)
    return { year: y, month: m - 1, day: d }
}

/** Parse a 'YYYY-MM-DD' (or ISO) string to a local Date at midnight. */
export function parseDateLocal(s: string): Date {
    const part = s.split('T')[0]
    const [y, m, d] = part.split('-').map(Number)
    return new Date(y, (m || 1) - 1, d || 1)
}

/** Format a Date as 'YYYY-MM-DD' in local time. */
export function toLocalDateStr(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/** Midnight of the given date, local time. */
export function startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Whole-day difference b - a (can be negative). */
export function daysBetween(a: Date, b: Date): number {
    return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000)
}

/** Build the element id used to identify a calendar day cell. */
export function dayId(dateStr: string): string {
    return `day-${dateStr.split('T')[0]}`
}
