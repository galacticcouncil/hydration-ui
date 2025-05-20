import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { nativeTokenLocksQuery, TokenLockType } from "@/api/balances"
import { bestNumberQuery } from "@/api/chain"
import { accountVotesQuery } from "@/api/democracy"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_ASSET_ID, PARACHAIN_BLOCK_TIME } from "@/utils/consts"

export const useNativeAssetLocks = () => {
  const { account } = useAccount()

  const { data, isLoading } = useQuery(
    nativeTokenLocksQuery(useRpcProvider(), account?.address ?? ""),
  )

  const lockedInVesting =
    data?.find((lock) => lock.type === TokenLockType.Vesting)?.amount || "0"
  const lockedInDemocracy =
    data?.find((lock) => lock.type === TokenLockType.Democracy)?.amount || "0"
  const lockedInOpenGov =
    data?.find((lock) => lock.type === TokenLockType.OpenGov)?.amount || "0"
  const lockedInStaking =
    data?.find((lock) => lock.type === TokenLockType.Staking)?.amount || "0"

  const [lockedInStakingDisplayPrice] = useDisplayAssetPrice(
    NATIVE_ASSET_ID,
    lockedInStaking,
  )

  const [lockedInDemocracyDisplayPrice] = useDisplayAssetPrice(
    NATIVE_ASSET_ID,
    lockedInDemocracy,
  )

  const [lockedInVestingDisplayPrice] = useDisplayAssetPrice(
    NATIVE_ASSET_ID,
    lockedInVesting,
  )

  const [lockedInOpenGovDisplayPrice] = useDisplayAssetPrice(
    NATIVE_ASSET_ID,
    lockedInOpenGov,
  )

  return {
    lockedInVesting,
    lockedInVestingDisplayPrice,
    lockedInDemocracy,
    lockedInDemocracyDisplayPrice,
    lockedInOpenGov,
    lockedInOpenGovDisplayPrice,
    lockedInStaking,
    lockedInStakingDisplayPrice,
    isLoading,
  }
}

export const useUnlockableNativeTokens = (lockedInDemocracy: string) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()

  const { data: bestNumber } = useQuery(bestNumberQuery(rpc))
  const { data, isLoading } = useQuery(
    accountVotesQuery(
      rpc,
      account?.address ?? "",
      bestNumber?.parachainBlockNumber ?? 0,
    ),
  )

  const lockedInDemocracyBig = new Big(lockedInDemocracy)
  const value = lockedInDemocracyBig.lte(0)
    ? "0"
    : lockedInDemocracyBig
        .minus(data?.maxLockedValue.toString() || "0")
        .toString()

  const [displayValue] = useDisplayAssetPrice(NATIVE_ASSET_ID, value)
  const unlockableIds = data?.ids ?? []

  const lockedSeconds = (data?.maxLockedBlock ?? 0) * PARACHAIN_BLOCK_TIME

  return {
    value,
    displayValue,
    lockedSeconds,
    unlockableIds,
    isLoading,
  }
}
