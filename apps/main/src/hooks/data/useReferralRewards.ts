import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { tokenBalanceQuery } from "@/api/balances"
import { accountReferralSharesQuery } from "@/api/referrals"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

const potAddress = "7L53bUTCCAvmCxhe15maHwJZbjQYH89LkXuyTnTi1J58xyFC"

export const useReferralRewards = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()

  const { native } = useAssets()
  const referralShares = useQuery(
    accountReferralSharesQuery(rpc, account?.address ?? ""),
  )

  const potBalance = useQuery(tokenBalanceQuery(rpc, native.id, potAddress))

  const isLoading = referralShares.isLoading || potBalance.isLoading
  if (!isLoading && referralShares.data) {
    const { referrerShares, traderShares, totalShares } = referralShares.data
    const accountShares = referrerShares + traderShares

    const totalRewards = Big(accountShares.toString())
      .div(totalShares.toString())
      .mul(potBalance.data?.freeBalance ?? "1")

    const referrerRewards = Big(referrerShares.toString())
      .div(totalShares.toString())
      .mul(potBalance.data?.freeBalance ?? "1")

    return {
      isLoading,
      data: {
        totalRewards: scaleHuman(totalRewards.toString(), native.decimals),
        referrerRewards: scaleHuman(
          referrerRewards.toString(),
          native.decimals,
        ),
        symbol: native.symbol,
      },
    }
  }

  return { isLoading, data: undefined }
}
