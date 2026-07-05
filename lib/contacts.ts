// Relationship presets + how each maps to a badge tone. Any custom label the
// user types still works — it just falls back to a neutral badge.

export const RELATIONSHIP_PRESETS = ['Great', 'Good', 'Neutral', 'Difficult', 'Bad'] as const

export type BadgeVariant =
    | 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline' | 'highlight' | 'solid'

export function relationshipVariant(rel?: string): BadgeVariant {
    const r = (rel || '').trim().toLowerCase()
    if (!r) return 'outline'
    if (['great', 'excellent', 'amazing', 'best', 'love them'].includes(r)) return 'success'
    if (['good', 'friendly', 'solid', 'positive'].includes(r)) return 'primary'
    if (['neutral', 'ok', 'okay', 'fine', 'meh'].includes(r)) return 'outline'
    if (['difficult', 'complicated', 'tough', 'rocky', 'strained'].includes(r)) return 'warning'
    if (['bad', 'terrible', 'awful', 'avoid', 'fucked', 'hate them', "i don't like them", 'i dont like them'].includes(r)) return 'destructive'
    return 'default'
}
