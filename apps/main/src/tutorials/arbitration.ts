import { Tutorial, TutorialId, tutorials } from "@/tutorials/registry"

/** Anchors are identified positionally, so a mounted anchor is fully
 * described by its tutorial id and step index. */
export const anchorKey = (id: string, stepIndex: number) => `${id}:${stepIndex}`

/** Reordering steps means a new tutorial id, so a stored index that no longer
 * indexes into `steps` is clamped rather than treated as an error. */
export const clampStepIndex = (stepIndex: number, stepCount: number) => {
  if (!Number.isSafeInteger(stepIndex) || stepIndex < 0) return 0
  return Math.min(stepIndex, stepCount - 1)
}

export const isTutorialId = (id: string): id is TutorialId => id in tutorials

/** Declaration order in the registry is what breaks arbitration ties, so the
 * entries are read once, in order, rather than rebuilt per render. */
export const tutorialEntries = Object.entries(tutorials) as ReadonlyArray<
  readonly [TutorialId, Tutorial]
>

export type MountedAnchors = ReadonlyMap<string, number>

/** Two anchors for the same step can overlap across a route transition, so
 * mounts are counted rather than flagged. */
export const mountAnchor = (
  anchors: MountedAnchors,
  key: string,
): MountedAnchors => new Map(anchors).set(key, (anchors.get(key) ?? 0) + 1)

export const unmountAnchor = (
  anchors: MountedAnchors,
  key: string,
): MountedAnchors => {
  const next = new Map(anchors)
  const count = (next.get(key) ?? 0) - 1
  if (count > 0) next.set(key, count)
  else next.delete(key)
  return next
}

export type TutorialCandidate = {
  id: TutorialId
  stepIndex: number
  stepCount: number
}

export type ArbitrationInput = {
  entries: ReadonlyArray<readonly [TutorialId, Tutorial]>
  anchors: MountedAnchors
  retiredIds: readonly string[]
  progress: Readonly<Record<string, number>>
}

/**
 * At most one hint is live globally. The winner is the first registry entry
 * that is not retired, whose `when` holds, and whose current step has a
 * mounted anchor. A step without a mounted anchor waits — it is never skipped,
 * so a tutorial cannot silently complete unseen.
 */
export const selectLiveTutorial = ({
  entries,
  anchors,
  retiredIds,
  progress,
}: ArbitrationInput): TutorialCandidate | null => {
  for (const [id, tutorial] of entries) {
    if (retiredIds.includes(id)) continue
    if (tutorial.when && !tutorial.when()) continue

    const stepCount = tutorial.steps.length
    const stepIndex = clampStepIndex(progress[id] ?? 0, stepCount)

    if (!anchors.has(anchorKey(id, stepIndex))) continue

    return { id, stepIndex, stepCount }
  }

  return null
}

export const isSameCandidate = (
  a: TutorialCandidate | null,
  b: TutorialCandidate | null,
) => a?.id === b?.id && a?.stepIndex === b?.stepIndex
