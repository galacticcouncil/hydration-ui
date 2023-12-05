import { useMemo } from "react"
import { BN_10, BN_100 } from "utils/constants"

const MOCK_DATA = [
  {
    isIdentity: false,
    account: "7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba",
    volume: BN_100,
    rewards: BN_10,
    tier: 1,
  },
  {
    isIdentity: false,
    account: "7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba",
    volume: BN_100,
    rewards: BN_100,
    tier: 2,
  },
  {
    isIdentity: false,
    account: "7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba",
    volume: BN_100,
    rewards: BN_100,
    tier: 3,
  },
  {
    isIdentity: false,
    account: "7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba",
    volume: BN_100,
    rewards: BN_10,
    tier: 1,
  },
  {
    isIdentity: false,
    account: "7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba",
    volume: BN_100,
    rewards: BN_10,
    tier: 3,
  },
]

export const useReferralsTableData = () => {
  const data = useMemo(() => {
    return MOCK_DATA
  }, [])

  return { data, isLoading: false }
}

export type TReferralsTable = typeof useReferralsTableData
export type TReferralsTableData = ReturnType<TReferralsTable>["data"]
