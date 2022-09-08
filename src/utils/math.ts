import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "./queryKeys"

export const getMath = () => async () => {
  const [xyk, lbp] = await Promise.all([
    import("@galacticcouncil/math/build/xyk/bundler"),
    import("@galacticcouncil/math/build/lbp/bundler"),
  ])
  return {
    xyk,
    lbp,
  }
}

export const useMath = () => {
  const { data, ...rest } = useQuery(QUERY_KEYS.math, getMath())

  return {
    ...data,
    ...rest,
  }
}
