import {
  selectNonEmptyUserBorrowPositions,
  selectUserNonEmtpySummaryAndIncentive,
} from "sections/lending/store/poolSelectors"
import { useRootStore } from "sections/lending/store/root"

import { useCurrentTimestamp } from "./useCurrentTimestamp"

//TODO: move that to selectors once appDataContext is removed
export const useUserReserves = () => {
  const currentTimestamp = useCurrentTimestamp(5)
  const user = useRootStore((state) =>
    selectUserNonEmtpySummaryAndIncentive(state, currentTimestamp),
  )
  const borrowPositions = useRootStore((state) =>
    selectNonEmptyUserBorrowPositions(state, currentTimestamp),
  )

  return { user, borrowPositions }
}
