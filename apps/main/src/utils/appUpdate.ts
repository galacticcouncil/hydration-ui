import { create } from "zustand"

/**
 * Browsers cache aggressively and a long-lived tab never re-fetches the
 * document, so a tab left open on a chart for hours has to ask. Refocus covers
 * the backgrounded tab, the interval covers the one nobody touches.
 */
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000

/**
 * Two deploys rarely land within minutes of each other, so a mismatch right
 * after the banner was shown is more likely noise than a new build. The
 * timestamp is kept per tab and survives the reload the banner asks for.
 */
const REPEAT_WINDOW = 10 * 60 * 1000
const SHOWN_AT_KEY = "app-update-shown-at"

/**
 * The content-hashed entry bundle is the only part of index.html that
 * identifies a build. Anything else in the document can be rewritten on the
 * way to the user (antivirus, proxies, in-app browsers), so it is ignored.
 */
const getEntryScript = (html: string) =>
  html.match(/<script\b(?=[^>]*\stype="module")[^>]*\ssrc="([^"]+)"/)?.[1] ??
  null

const wasShownRecently = () => {
  try {
    const shownAt = Number(sessionStorage.getItem(SHOWN_AT_KEY))
    return Date.now() - shownAt < REPEAT_WINDOW
  } catch {
    // storage blocked — behave as if the banner was never shown
    return false
  }
}

export const useAppUpdateStore = create<{ isAvailable: boolean }>(() => ({
  isAvailable: false,
}))

/**
 * index.html references the content-hashed entry bundle, whose url changes on
 * every deploy that changes any code. We never read the live document: browser
 * extensions inject into it, so it is not a faithful copy of the build.
 */
const fetchIndex = async () => {
  const res = await fetch("/index.html", { cache: "no-cache" })
  return res.ok ? getEntryScript(await res.text()) : null
}

// the baseline is taken just after load rather than at load, so a
// deploy landing inside that window goes unnoticed by this tab. Stamp a build
// id into the bundle if that ever matters.
const baseline = fetchIndex().catch(() => null)

const check = async () => {
  if (useAppUpdateStore.getState().isAvailable) return

  try {
    const loaded = await baseline
    const deployed = await fetchIndex()

    if (loaded && deployed && loaded !== deployed && !wasShownRecently()) {
      useAppUpdateStore.setState({ isAvailable: true })
      sessionStorage.setItem(SHOWN_AT_KEY, String(Date.now()))
    }
  } catch {
    // offline or a network blip — the next check retries
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") check()
})

setInterval(check, UPDATE_CHECK_INTERVAL)
