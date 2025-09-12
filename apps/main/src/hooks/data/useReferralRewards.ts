import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { tokenBalanceQuery } from "@/api/balances"
import { accountReferralSharesQuery } from "@/api/referrals"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { POT_ADDRESS } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

export const useReferralRewards = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()

  const { native } = useAssets()
  const { data: referralSharesData, isLoading: referralSharesIsLoading } =
    useQuery(accountReferralSharesQuery(rpc, account?.address ?? ""))

  const { data: potBalanceData, isLoading: potBalanceIsLoading } = useQuery(
    tokenBalanceQuery(rpc, native.id, POT_ADDRESS),
  )

  const isLoading = referralSharesIsLoading || potBalanceIsLoading

  if (isLoading || !referralSharesData) {
    return { isLoading, data: undefined }
  }

  const { referrerShares, traderShares, totalShares } = referralSharesData
  const accountShares = referrerShares + traderShares
  const freeBalance = potBalanceData?.freeBalance ?? "1"

  const totalRewards = Big(accountShares.toString())
    .div(totalShares.toString())
    .mul(freeBalance)

  const referrerRewards = Big(referrerShares.toString())
    .div(totalShares.toString())
    .mul(freeBalance)

  return {
    isLoading,
    data: {
      totalRewards: scaleHuman(totalRewards.toString(), native.decimals),
      referrerRewards: scaleHuman(referrerRewards.toString(), native.decimals),
      symbol: native.symbol,
    },
  }
}
