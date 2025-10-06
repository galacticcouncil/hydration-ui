import { useMemo } from "react"

export const useStableArray = <T extends string | number | bigint | boolean>(
  arr: T[],
): T[] => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => arr, [arr.join(",")])
}
