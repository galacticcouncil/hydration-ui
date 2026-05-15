// Phase 5d — `useBroadcasters` hook.
//
// Thin facade over BroadcasterContext that matches the surface the spec asked
// for: `{ list, refresh, selected, select }`. Components that only need to
// read/select stay decoupled from the broadcast() thunk.

import { useBroadcasterContext } from "sections/privacy/providers/BroadcasterProvider"
import { Broadcaster } from "sections/privacy/utils/broadcasters"

export type UseBroadcasters = {
  list: Broadcaster[]
  refresh: () => void
  selected: Broadcaster | null
  select: (b: Broadcaster | null) => void
  isMock: boolean
}

export const useBroadcasters = (): UseBroadcasters => {
  const { broadcasters, refresh, selected, selectBroadcaster, isMock } =
    useBroadcasterContext()
  return {
    list: broadcasters,
    refresh,
    selected,
    select: selectBroadcaster,
    isMock,
  }
}
