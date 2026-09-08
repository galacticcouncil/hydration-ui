import { TutorialsState, useTutorialsStore } from "@/states/tutorials"

const RESET_PARAM = "resetTutorials"
const RESET_ALL = "all"

/** Kept pure so the reset rules can be exercised without a store or a URL. An
 * unknown id simply filters nothing out. */
export const resetTutorialsState = (
  state: TutorialsState,
  target: string,
): TutorialsState => {
  if (target === RESET_ALL) return { retiredIds: [], progress: {} }

  return {
    retiredIds: state.retiredIds.filter((id) => id !== target),
    progress: Object.fromEntries(
      Object.entries(state.progress).filter(([id]) => id !== target),
    ),
  }
}

/**
 * `?resetTutorials=<tutorialId>` (or `=all`) replays a hint in a deployed
 * preview build without clearing site data. Handled once on load, and the
 * parameter is stripped afterwards so a reload does not re-fire it.
 */
export const applyResetTutorialsParam = () => {
  const url = new URL(window.location.href)
  const target = url.searchParams.get(RESET_PARAM)
  if (target === null) return

  useTutorialsStore.setState((state) => resetTutorialsState(state, target))

  url.searchParams.delete(RESET_PARAM)
  window.history.replaceState(null, "", url)
}
