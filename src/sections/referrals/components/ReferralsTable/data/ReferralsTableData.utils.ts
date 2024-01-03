import { useAccountReferees } from "api/referrals"
import { useMemo } from "react"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { getChainSpecificAddress } from "utils/formatting"

export const useReferralsTableData = () => {
  const { account } = useAccount()
  const referees = useAccountReferees(
    account?.address ? getChainSpecificAddress(account.address) : undefined,
  )

  const data = useMemo(() => {
    if (!referees.data) return []
    return referees.data.map((referee) => ({
      account: referee.referee,
    }))
  }, [referees.data])

  return { data, isLoading: false }
}

export type TReferralsTable = typeof useReferralsTableData
export type TReferralsTableData = ReturnType<TReferralsTable>["data"]
