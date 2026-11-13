import { create } from "zustand"

export type HbrSession = {
  token: string
  /** The session's wallet, lowercase, as the server returned it. */
  h160: string
  expiresAt: string
}

type HbrSessionStore = {
  session: HbrSession | null
  setSession: (session: HbrSession) => void
  /** Drops the session, in memory and in sessionStorage. */
  clear: () => void
  /** Clears only when `token` is still the live one (a late 401 of an old token keeps a newer session). */
  discardToken: (token: string) => void
  /** Sign-out of `h160`: its session goes, in memory and in sessionStorage. */
  signOut: (h160: string) => void
  /** Puts a session read back from sessionStorage into memory (no write). */
  restore: (session: HbrSession) => void
}

/*
 * Where the token lives (owner decision 2026-11-13): in memory and in this
 * tab's sessionStorage, so a reload in the same tab keeps the user signed in
 * and closing the tab ends it. One entry, keyed by the session's wallet, holds
 * exactly { token, h160, expiresAt } and nothing else. It is read back only
 * for the wallet it names (`readStoredSession(h160)`), dropped when expired or
 * malformed, and removed on sign-out, on any 401 for its token, and when the
 * session is cleared. Every storage access is guarded: no sessionStorage, or
 * one that throws, means memory only. Never log the token.
 */
const KEY_PREFIX = "hbr-session:"
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/
const H160_RE = /^0x[0-9a-f]{40}$/

const storage = (): Storage | null => {
  try {
    return globalThis.sessionStorage ?? null
  } catch {
    return null
  }
}

const storedKeys = (store: Storage): string[] => {
  const keys: string[] = []
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i)
    if (key?.startsWith(KEY_PREFIX)) keys.push(key)
  }
  return keys
}

const parseOrNull = (raw: string | null): unknown => {
  try {
    return JSON.parse(raw ?? "null")
  } catch {
    return null
  }
}

const removeStored = (match: (entry: unknown) => boolean = () => true) => {
  const store = storage()
  if (!store) return
  try {
    for (const key of storedKeys(store))
      if (match(parseOrNull(store.getItem(key)))) store.removeItem(key)
  } catch {
    // Storage unavailable: memory only.
  }
}

const writeStored = (session: HbrSession) => {
  const store = storage()
  if (!store) return
  try {
    removeStored()
    const entry = {
      token: session.token,
      h160: session.h160,
      expiresAt: session.expiresAt,
    }
    store.setItem(KEY_PREFIX + session.h160, JSON.stringify(entry))
  } catch {
    // Storage unavailable or full: memory only.
  }
}

/**
 * The stored session of `h160` (any case), or null. An entry that is expired,
 * malformed or carries anything but its three fields is removed and never
 * returned; an entry of another wallet is never read.
 */
export const readStoredSession = (
  h160: string,
  now: number = Date.now(),
): HbrSession | null => {
  const store = storage()
  if (!store) return null
  const wallet = h160.toLowerCase()
  const key = KEY_PREFIX + wallet
  try {
    const raw = store.getItem(key)
    if (raw === null) return null
    const entry = parseOrNull(raw) as Partial<HbrSession> | null
    if (
      entry &&
      typeof entry === "object" &&
      Object.keys(entry).length === 3 &&
      typeof entry.token === "string" &&
      TOKEN_RE.test(entry.token) &&
      entry.h160 === wallet &&
      H160_RE.test(wallet) &&
      typeof entry.expiresAt === "string" &&
      Date.parse(entry.expiresAt) > now
    )
      return { token: entry.token, h160: wallet, expiresAt: entry.expiresAt }
    store.removeItem(key)
    return null
  } catch {
    return null
  }
}

export const useHbrSessionStore = create<HbrSessionStore>((set, get) => ({
  session: null,
  setSession: (session) => {
    const next = { ...session, h160: session.h160.toLowerCase() }
    set({ session: next })
    writeStored(next)
  },
  clear: () => {
    set({ session: null })
    removeStored()
  },
  discardToken: (token) => {
    if (get().session?.token === token) set({ session: null })
    removeStored(
      (entry) => !!entry && (entry as Partial<HbrSession>).token === token,
    )
  },
  signOut: (h160) => {
    const wallet = h160.toLowerCase()
    if (get().session?.h160 === wallet) set({ session: null })
    removeStored(
      (entry) => !entry || (entry as Partial<HbrSession>).h160 === wallet,
    )
  },
  restore: (session) => set({ session }),
}))

/** The session when it belongs to `h160` (any case), else null. */
export const liveSessionFor = (
  session: HbrSession | null,
  h160: string,
): HbrSession | null =>
  session !== null && session.h160 === h160.toLowerCase() ? session : null

/**
 * The service's view of the store: a token only for the wallet a call was
 * made for (memory first, then this tab's stored entry of that wallet), so a
 * call started under wallet A never goes out with B's token.
 */
export const hbrSessionAccess = {
  getToken: (h160: string) =>
    liveSessionFor(useHbrSessionStore.getState().session, h160)?.token ??
    readStoredSession(h160)?.token ??
    null,
  onUnauthorized: (token: string) =>
    useHbrSessionStore.getState().discardToken(token),
}
