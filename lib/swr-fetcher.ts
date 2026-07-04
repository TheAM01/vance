/**
 * Default SWR fetcher that treats non-OK HTTP responses as errors, so SWR
 * populates its `error` state and `data` stays `undefined` (letting `if (!data)`
 * guards work) rather than passing an `{ error }` body through as real data.
 */
export const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        let message: string
        try {
            const body = await res.json()
            message = body?.error || `Request failed (${res.status})`
        } catch {
            message = `Request failed (${res.status})`
        }
        const err = new Error(message) as Error & { status: number }
        err.status = res.status
        throw err
    }
    return res.json()
}
