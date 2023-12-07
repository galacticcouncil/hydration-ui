import { useTokensBalances } from "api/balances"
import { useOmnipoolAssets } from "api/omnipool"
import { useMemo } from "react"
import { useAssetsTradability } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { NATIVE_ASSET_ID, OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { getFloatingPointAmount, normalizeBigNumber } from "utils/balance"
import { BN_0, BN_MILL, BN_NAN } from "utils/constants"
import { useDisplayPrices, useDisplayShareTokenPrice } from "utils/displayAsset"
import { useStableswapPool, useStableswapPools } from "api/stableswap"
import { pool_account_name } from "@galacticcouncil/math-stableswap"
import { encodeAddress, blake2AsHex } from "@polkadot/util-crypto"
import { HYDRADX_SS58_PREFIX } from "@galacticcouncil/sdk"
import { useAccountBalances } from "api/accountBalances"
import { useRpcProvider } from "providers/rpcProvider"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { isNotNil, undefinedNoop } from "utils/helpers"
import { ApiPromise } from "@polkadot/api"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { useVolume } from "api/volume"
import BN from "bignumber.js"
import { useGetXYKPools, useShareTokens, useXYKConsts } from "api/xyk"
import { useShareOfPools } from "api/pools"
import { TShareToken } from "api/assetDetails"
import { useXYKPoolTradeVolumes } from "./pool/details/PoolDetails.utils"
import { useAllUserDepositShare } from "./farms/position/FarmingPosition.utils"

export type TMiningNftPosition = ReturnType<
  typeof usePoolDetails
>["data"]["miningNftPositions"][number]

export const isXYKPoolType = (pool: TPool | TXYKPool): pool is TXYKPool =>
  !!(pool as TXYKPool).shareTokenIssuance

export type TPool = NonNullable<ReturnType<typeof usePools>["data"]>[number]
export type TPoolDetails = NonNullable<
  ReturnType<typeof usePoolDetails>["data"]
>
export type TPoolFullData = TPool & TPoolDetails
export type TXYKPoolFullData = TXYKPool &
  NonNullable<ReturnType<typeof useXYKPoolDetails>["data"]>

export const derivePoolAccount = (assetId: string) => {
  const name = pool_account_name(Number(assetId))
  return encodeAddress(blake2AsHex(name), HYDRADX_SS58_PREFIX)
}

export const useAccountOmnipoolPositions = () => {
  const { account } = useAccount()
  const { api } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.accountOmnipoolPositions(account?.address),
    account?.address != null
      ? async () => {
          const [omnipoolNftId, miningNftId] = await Promise.all([
            api.consts.omnipool.nftCollectionId,
            api.consts.omnipoolLiquidityMining.nftCollectionId,
          ])

          const [omnipoolNftsRaw, miningNftsRaw] = await Promise.all([
            api.query.uniques.account.entries(account?.address, omnipoolNftId),
            api.query.uniques.account.entries(account?.address, miningNftId),
          ])

          const omnipoolNfts = omnipoolNftsRaw.map(([storageKey]) => {
            const [owner, classId, instanceId] = storageKey.args
            return {
              owner: owner.toString(),
              classId: classId.toString(),
              instanceId: instanceId.toString(),
            }
          })

          const miningNfts = miningNftsRaw.map(([storageKey]) => {
            const [owner, classId, instanceId] = storageKey.args
            return {
              owner: owner.toString(),
              classId: classId.toString(),
              instanceId: instanceId.toString(),
            }
          })

          return { omnipoolNfts, miningNfts }
        }
      : undefinedNoop,
    { enabled: !!account?.address },
  )
}

export const useAccountMiningPositions = () => {
  const { api } = useRpcProvider()
  const { data } = useAccountOmnipoolPositions()

  return useQueries({
    queries: data?.miningNfts
      ? data.miningNfts.map((nft) => ({
          queryKey: QUERY_KEYS.miningPosition(nft.instanceId),
          queryFn: getMiningPosition(api, nft.instanceId),
          enabled: !!nft.instanceId,
        }))
      : [],
  })
}

const getMiningPosition = (api: ApiPromise, id: string) => async () => {
  const dataRaw = await api.query.omnipoolWarehouseLM.deposit(id)
  const data = dataRaw.unwrap()

  return { id, data }
}

const getTradeFee = (fee: string[]) => {
  if (fee?.length !== 2) return BN_NAN

  const numerator = new BN(fee[0])
  const denominator = new BN(fee[1])
  const tradeFee = numerator.div(denominator)

  return tradeFee.times(100)
}

export type TXYKPool = NonNullable<
  ReturnType<typeof useXYKPools>["data"]
>[number]

export const usePools = () => {
  const { assets } = useRpcProvider()

  const omnipoolAssets = useOmnipoolAssets()
  const stablepools = useStableswapPools()

  const assetsTradability = useAssetsTradability()

  const assetsId = useMemo(
    () => omnipoolAssets.data?.map((a) => a.id.toString()) ?? [],
    [omnipoolAssets.data],
  )

  const omnipoolBalances = useTokensBalances(assetsId, OMNIPOOL_ACCOUNT_ADDRESS)

  const assetsByStablepool = [
    ...new Set(
      stablepools.data
        ?.map((stablepool) =>
          stablepool.data.assets.map((asset) => asset.toString()),
        )
        .flat(),
    ),
  ]

  const spotPrices = useDisplayPrices([...assetsId, ...assetsByStablepool])

  const queries = [
    omnipoolAssets,
    spotPrices,
    assetsTradability,
    ...omnipoolBalances,
  ]

  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !omnipoolAssets.data ||
      !spotPrices.data ||
      !assetsTradability.data ||
      omnipoolBalances.some((q) => !q.data)
    )
      return undefined

    const rows = assetsId.map((assetId) => {
      const meta = assets.getAsset(assetId)

      const omnipoplBalance = omnipoolBalances.find(
        (b) => b.data?.assetId.toString() === assetId,
      )?.data?.balance

      const spotPrice = spotPrices.data?.find((sp) => sp?.tokenIn === assetId)
        ?.spotPrice

      const tvl = getFloatingPointAmount(omnipoplBalance ?? BN_0, meta.decimals)
      const tvlDisplay = !spotPrice ? BN_NAN : tvl.times(spotPrice)

      const tradabilityData = assetsTradability.data?.find(
        (t) => t.id === assetId,
      )

      const tradability = {
        canAddLiquidity: !!tradabilityData?.canAddLiquidity,
        canRemoveLiquidity: !!tradabilityData?.canRemoveLiquidity,
      }

      return {
        id: assetId,
        name: meta.name,
        symbol: meta.symbol,
        fee: BN_0,
        tvl,
        tvlDisplay,
        spotPrice,
        canAddLiquidity: tradability.canAddLiquidity,
        canRemoveLiquidity: tradability.canRemoveLiquidity,
      }
    })

    return rows.sort((poolA, poolB) => {
      if (poolA.id === NATIVE_ASSET_ID) {
        return -1
      }

      if (poolB.id === NATIVE_ASSET_ID) {
        return 1
      }

      return poolA.tvlDisplay.gt(poolB.tvlDisplay) ? -1 : 1
    })
  }, [
    assets,
    assetsId,
    assetsTradability.data,
    omnipoolAssets.data,
    omnipoolBalances,
    spotPrices.data,
  ])

  data?.sort((poolA, poolB) => {
    if (poolA.id.toString() === NATIVE_ASSET_ID) {
      return -1
    }

    if (poolB.id.toString() === NATIVE_ASSET_ID) {
      return 1
    }

    return poolA.tvlDisplay.gt(poolB.tvlDisplay) ? -1 : 1
  })

  return { data, isLoading: isInitialLoading }
}

export const usePoolDetails = (assetId: string) => {
  const { assets } = useRpcProvider()
  const meta = assets.getAsset(assetId)
  const isStablePool = assets.isStableSwap(meta)

  const miningPositions = useAccountMiningPositions()
  const omnipoolPositions = useOmnipoolPositionsData()

  const poolAccountAddress = derivePoolAccount(assetId)

  const stablePoolBalance = useAccountBalances(
    isStablePool ? poolAccountAddress : undefined,
  )
  const stablepool = useStableswapPool(isStablePool ? assetId : undefined)

  const volume = useVolume(assetId)

  const isInitialLoading =
    omnipoolPositions.isInitialLoading ||
    volume.isInitialLoading ||
    stablePoolBalance.isInitialLoading

  const data = useMemo(() => {
    const omnipoolNftPositions = omnipoolPositions.data.filter(
      (position) => position.assetId === assetId,
    )

    const miningNftPositions = miningPositions
      .filter(
        (position) => position.data?.data.ammPoolId.toString() === assetId,
      )
      .map((position) => position.data)
      .filter(isNotNil)

    const reserves = isStablePool
      ? (stablePoolBalance.data?.balances ?? []).map((balance) => {
          const id = balance.id.toString()
          const meta = assets.getAsset(id)

          return {
            asset_id: Number(id),
            decimals: meta.decimals,
            amount: balance.freeBalance.toString(),
          }
        })
      : []

    return {
      volumeDisplay: volume.data?.volume,
      omnipoolNftPositions,
      miningNftPositions,
      reserves,
      stablepoolFee: stablepool.data?.fee
        ? normalizeBigNumber(stablepool.data.fee).div(BN_MILL)
        : undefined,
      isStablePool,
    }
  }, [
    assetId,
    assets,
    isStablePool,
    miningPositions,
    omnipoolPositions.data,
    stablePoolBalance.data?.balances,
    stablepool.data?.fee,
    volume.data?.volume,
  ])

  return { data, isInitialLoading }
}

export const useMyPools = () => {
  const { account } = useAccount()
  const { assets } = useRpcProvider()

  const pools = usePools()

  const omnipoolPositions = useOmnipoolPositionsData()
  const miningPositions = useAllUserDepositShare()

  const stableswapsId = assets.stableswap.map((shareToken) => shareToken.id)

  const userPositions = useTokensBalances(stableswapsId, account?.address)

  const data = useMemo(() => {
    if (
      pools.data &&
      omnipoolPositions.data &&
      miningPositions.data &&
      userPositions.every((userPosition) => userPosition.data)
    ) {
      return pools.data?.filter(
        (pool) =>
          omnipoolPositions.data.some(
            (omnipoolPosition) => omnipoolPosition.assetId === pool.id,
          ) ||
          miningPositions.data?.[pool.id] ||
          userPositions.some(
            (userPosition) =>
              userPosition.data?.assetId === pool.id &&
              userPosition.data.balance.gt(0),
          ),
      )
    }
    return undefined
  }, [miningPositions.data, omnipoolPositions.data, pools.data, userPositions])

  return {
    data,
    isLoading:
      pools.isLoading ||
      omnipoolPositions.isInitialLoading ||
      miningPositions.isLoading,
  }
}

export const useXYKPools = (withPositions?: boolean) => {
  const { assets } = useRpcProvider()

  const pools = useGetXYKPools()
  const xykConsts = useXYKConsts()

  const shareTokens = useShareTokens()

  const shareTokensId =
    shareTokens.data?.map((shareToken) => shareToken.shareTokenId) ?? []

  const totalIssuances = useShareOfPools(shareTokensId)
  const shareTokeSpotPrices = useDisplayShareTokenPrice(shareTokensId)

  const fee = xykConsts.data?.fee ? getTradeFee(xykConsts.data?.fee) : BN_NAN

  const queries = [
    pools,
    shareTokens,
    xykConsts,
    shareTokeSpotPrices,
    totalIssuances,
  ]

  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !pools.data ||
      !shareTokens.data ||
      !shareTokeSpotPrices.data ||
      !totalIssuances.data
    )
      return undefined

    return pools.data
      .map((pool) => {
        const shareTokenId = shareTokens.data?.find(
          (shareToken) => shareToken.poolAddress === pool.poolAddress,
        )?.shareTokenId

        if (!shareTokenId) return undefined

        const shareTokenMeta = assets.getAsset(shareTokenId) as TShareToken

        const shareTokenIssuance = totalIssuances.data?.find(
          (issuance) => issuance.asset === shareTokenId,
        )

        const shareTokenSpotPrice = shareTokeSpotPrices.data.find(
          (shareTokeSpotPrice) => shareTokeSpotPrice.tokenIn === shareTokenId,
        )

        const tvlDisplay =
          shareTokenIssuance?.totalShare
            ?.shiftedBy(-shareTokenMeta.decimals)
            ?.multipliedBy(shareTokenSpotPrice?.spotPrice ?? 1) ?? BN_0

        return {
          id: shareTokenMeta.id,
          symbol: shareTokenMeta.symbol,
          name: shareTokenMeta.name,
          tvlDisplay,
          spotPrice: shareTokenSpotPrice?.spotPrice,
          fee,
          isXykPool: true,
          poolAddress: pool.poolAddress,
          canAddLiquidity: true,
          canRemoveLiquidity: true,
          shareTokenIssuance,
        }
      })
      .filter(isNotNil)
      .filter((pool) =>
        withPositions ? pool.shareTokenIssuance?.myPoolShare?.gt(0) : true,
      )
  }, [
    assets,
    fee,
    pools.data,
    shareTokeSpotPrices.data,
    shareTokens.data,
    totalIssuances.data,
    withPositions,
  ])

  return { data, isInitialLoading }
}

export const useXYKPoolDetails = (pool: TXYKPool) => {
  const volume = useXYKPoolTradeVolumes([pool.poolAddress])

  const isInitialLoading = volume.isLoading

  return {
    data: { volumeDisplay: volume.data?.[0].volume ?? BN_0 },
    isInitialLoading,
  }
}
