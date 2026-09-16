import { create } from "zustand"

/**
 * Browsers cache aggressively and a long-lived tab never re-fetches the
 * document, so a tab left open on a chart for hours has to ask. Refocus covers
 * the backgrounded tab, the interval covers the one nobody touches.
 */
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000

export const useAppUpdateStore = create<{ isAvailable: boolean }>(() => ({
  isAvailable: false,
}))

/**
 * index.html references the content-hashed entry bundle, so its bytes change on
 * every deploy that changes any code. We never read the live document: browser
 * extensions inject into it, so it is not a faithful copy of the build.
 */
const fetchIndex = async () => {
  const res = await fetch("/index.html", { cache: "no-cache" })
  return res.ok ? res.text() : null
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

    if (loaded && deployed && loaded !== deployed) {
      useAppUpdateStore.setState({ isAvailable: true })
    }
  } catch {
    // offline or a network blip — the next check retries
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") check()
})

setInterval(check, UPDATE_CHECK_INTERVAL)
