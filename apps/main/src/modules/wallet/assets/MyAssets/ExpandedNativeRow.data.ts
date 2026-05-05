import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { nativeTokenLocksQuery, TokenLockType } from "@/api/balances"
import { openGovUnlockedTokensQuery } from "@/api/democracy"
import { useProxyUrl } from "@/api/provider"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_ASSET_ID, PARACHAIN_BLOCK_TIME } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

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

export const useUnlockableNativeTokens = (lockedInReferenda: string) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { native } = useAssets()
  const indexerUrl = useProxyUrl()

  const { data: unlockedTokens, isLoading: unlockedTokensLoading } = useQuery(
    openGovUnlockedTokensQuery(
      rpc,

      account?.address ?? "",
      indexerUrl,
    ),
  )

  const lockedInReferendaBig = new Big(lockedInReferenda)

  const maxLocked = scaleHuman(
    unlockedTokens?.maxLockedValue ?? "0",
    native.decimals,
  )

  const value = lockedInReferendaBig.lte(0)
    ? "0"
    : lockedInReferendaBig.minus(maxLocked).toString()

  const [displayValue] = useDisplayAssetPrice(native.id, value)

  const lockedSeconds =
    (unlockedTokens?.maxLockedBlock ?? 0) * PARACHAIN_BLOCK_TIME

  return {
    value,
    displayValue,
    lockedSeconds,
    unlockableIds: [],
    votesToRemove: unlockedTokens?.votesToRemove ?? [],
    classIds: unlockedTokens?.classIds ?? [],
    isLoading: unlockedTokensLoading,
  }
}
