import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { useIsOverlayOpen } from "@/hooks/useIsOverlayOpen"
import { useTransactionsStore } from "@/states/transactions"
import { useTutorialsStore } from "@/states/tutorials"
import {
  anchorKey,
  isSameCandidate,
  mountAnchor,
  MountedAnchors,
  selectLiveTutorial,
  TutorialCandidate,
  tutorialEntries,
  unmountAnchor,
} from "@/tutorials/arbitration"
import { TutorialId } from "@/tutorials/registry"

/** Long enough to swallow a route transition and the initial app load. */
const OPEN_DELAY = 400

/** `when` predicates read arbitrary zustand stores, so there is nothing
 * concrete to subscribe to from here.
 *
 * ponytail: a 1s re-evaluation while anchors are mounted is the cheap way to
 * pick up any store change. Upgrade path: let a registry entry declare the
 * store it depends on and subscribe to it directly. */
const PREDICATE_POLL = 1000

type TutorialContextValue = {
  live: TutorialCandidate | null
  registerAnchor: (id: TutorialId, stepIndex: number) => () => void
  advance: (id: TutorialId) => void
  retire: (id: TutorialId) => void
}

const TutorialContext = createContext<TutorialContextValue>({
  live: null,
  registerAnchor: () => () => {},
  advance: () => {},
  retire: () => {},
})

export const useTutorialContext = () => useContext(TutorialContext)

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [anchors, setAnchors] = useState<MountedAnchors>(new Map())
  const [candidate, setCandidate] = useState<TutorialCandidate | null>(null)
  const [openedKey, setOpenedKey] = useState<string | null>(null)

  const retiredIds = useTutorialsStore((state) => state.retiredIds)
  const progress = useTutorialsStore((state) => state.progress)
  const retireTutorial = useTutorialsStore((state) => state.retireTutorial)
  const setProgress = useTutorialsStore((state) => state.setProgress)

  const isOverlayOpen = useIsOverlayOpen()
  const isTransacting = useTransactionsStore(
    (state) =>
      state.transactions.length > 0 || state.pendingTransactions.length > 0,
  )
  const isSuppressed = isOverlayOpen || isTransacting

  const registerAnchor = useCallback((id: TutorialId, stepIndex: number) => {
    const key = anchorKey(id, stepIndex)
    setAnchors((current) => mountAnchor(current, key))
    return () => setAnchors((current) => unmountAnchor(current, key))
  }, [])

  useEffect(() => {
    const evaluate = () =>
      setCandidate((current) => {
        const next = isSuppressed
          ? null
          : selectLiveTutorial({
              entries: tutorialEntries,
              anchors,
              retiredIds,
              progress,
            })

        return isSameCandidate(current, next) ? current : next
      })

    evaluate()

    if (anchors.size === 0) return

    const interval = setInterval(evaluate, PREDICATE_POLL)
    return () => clearInterval(interval)
  }, [anchors, isSuppressed, progress, retiredIds])

  const candidateKey = candidate
    ? anchorKey(candidate.id, candidate.stepIndex)
    : null

  // The anchor mounting is the trigger; an anchor that goes away before the
  // delay elapses never opens, and one that comes back starts over.
  useEffect(() => {
    if (!candidateKey) {
      setOpenedKey(null)
      return
    }

    const timeout = setTimeout(() => setOpenedKey(candidateKey), OPEN_DELAY)
    return () => clearTimeout(timeout)
  }, [candidateKey])

  const value = useMemo<TutorialContextValue>(
    () => ({
      live: candidateKey && candidateKey === openedKey ? candidate : null,
      registerAnchor,
      advance: (id) => {
        if (!candidate || candidate.id !== id) return

        const next = candidate.stepIndex + 1
        if (next >= candidate.stepCount) retireTutorial(id)
        else setProgress(id, next)
      },
      retire: retireTutorial,
    }),
    [
      candidate,
      candidateKey,
      openedKey,
      registerAnchor,
      retireTutorial,
      setProgress,
    ],
  )

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  )
}
