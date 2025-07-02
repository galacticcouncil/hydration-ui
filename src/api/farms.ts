import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"
import {
  PalletLiquidityMiningGlobalFarmData,
  PalletLiquidityMiningYieldFarmData,
} from "@polkadot/types/lookup"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { secondsInYear } from "date-fns"
import { BLOCK_TIME, BN_0, BN_1 } from "utils/constants"
import { noop, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { useBestNumber } from "./chain"
import { fixed_from_rational } from "@galacticcouncil/math-liquidity-mining"
import BN from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { useIndexerUrl } from "./provider"
import request, { gql } from "graphql-request"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useMemo } from "react"
import { scale } from "utils/balance"
import { getAccountResolver } from "utils/farms/claiming/accountResolver"
import { getAccountAssetBalances } from "./accountBalances"
import { TAsset, useAssets } from "providers/assets"
import { getTokenBalance } from "./balances"
import { t } from "i18next"
import { scaleHuman } from "utils/balance"
import { MultiCurrencyContainer } from "utils/farms/claiming/multiCurrency"
import { OmnipoolLiquidityMiningClaimSim } from "utils/farms/claiming/claimSimulator"
import { createMutableFarmEntry } from "utils/farms/claiming/mutableFarms"
import { TDeposit, useAccountAssets } from "./deposits"
import { millisecondsInHour, millisecondsInMinute } from "date-fns/constants"
import { getCurrentLoyaltyFactor } from "utils/farms/apr"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BalanceClient } from "@galacticcouncil/sdk"
import { useAssetsPrice } from "state/displayPrice"

const NEW_YIELD_FARMS_BLOCKS = (48 * 60 * 60) / 6

type TFarmIds = {
  poolId: string
  globalFarmId: string
  yieldFarmId: string
  isActive: boolean
}

export type TClaimableFarmValue = {
  poolId: string
  value: string
  claimableValue: string
  maxValue: string
  rewardCurrency: string
  yieldFarmId: string
  globalFarmId: string
  depositId: string
  isXyk: boolean
  liquidityPositionId?: string
  shares: string
  loyaltyFactor: string
  isClaimable: boolean
  isActiveFarm: boolean
}

export type TFarmAprData = {
  poolId: string
  yieldFarmId: string
  globalFarmId: string
  isActive: boolean
  apr: string
  rewardCurrency: string
  incentivizedAsset: string
  minDeposit: string
  blocksPerPeriod: string
  plannedYieldingPeriods: string
  estimatedEndBlock: string
  loyaltyCurve: {
    initialRewardPercentage: string
    scaleCoef: string
  }
  fullness: string
  maxRewards: string
  distributedRewards: string
  diffRewards: string
}

const getActiveFarms =
  (api: ApiPromise, isXyk: boolean = false) =>
  async () => {
    const allEntries = isXyk
      ? await api.query.xykWarehouseLM.activeYieldFarm.entries()
      : await api.query.omnipoolWarehouseLM.activeYieldFarm.entries()

    return allEntries.map(([storageKey, codec]) => {
      const [poolIdRaw, globalFarmIdRaw] = storageKey.args

      const yieldFarmId = codec.toString()
      const poolId = poolIdRaw.toString()
      const globalFarmId = globalFarmIdRaw.toString()

      return {
        poolId,
        globalFarmId,
        yieldFarmId,
        isActive: true,
      }
    })
  }

const getStoppedFarms = (deposits: TDeposit[], activeFarms: TFarmIds[]) =>
  deposits.reduce<TFarmIds[]>((result, deposit) => {
    const missingEntries = deposit.data.yieldFarmEntries.filter((entry) => {
      const isActive = activeFarms.some(
        (activeFarm) =>
          activeFarm.poolId === deposit.data.ammPoolId &&
          activeFarm.yieldFarmId === entry.yieldFarmId &&
          activeFarm.globalFarmId === entry.globalFarmId,
      )
      return !isActive
    })

    missingEntries.forEach((entry) => {
      const isAlreadyInResult = result.some(
        (item) =>
          item.yieldFarmId === entry.yieldFarmId &&
          item.poolId === deposit.data.ammPoolId &&
          item.globalFarmId === entry.globalFarmId,
      )

      if (!isAlreadyInResult) {
        result.push({
          yieldFarmId: entry.yieldFarmId,
          poolId: deposit.data.ammPoolId,
          globalFarmId: entry.globalFarmId,
          isActive: false,
        })
      }
    })

    return result
  }, [])

const getFarmsData =
  (
    api: ApiPromise,
    balanceClient: BalanceClient,
    activeFarms: TFarmIds[],
    getAsset: (id: string) => TAsset,
    isXyk: boolean = false,
  ) =>
  async () => {
    const accountResolver = getAccountResolver(api.registry)

    const parachainBlockNumber = await api.derive.chain.bestNumber()

    const farmsData = activeFarms.map(async (farm) => {
      const { isActive, globalFarmId, yieldFarmId, poolId } = farm
      const yieldFarmRaw = isXyk
        ? await api.query.xykWarehouseLM.yieldFarm(
            poolId,
            globalFarmId,
            yieldFarmId,
          )
        : await api.query.omnipoolWarehouseLM.yieldFarm(
            poolId,
            globalFarmId,
            yieldFarmId,
          )

      const globalFarmRaw = isXyk
        ? await api.query.xykWarehouseLM.globalFarm(globalFarmId)
        : await api.query.omnipoolWarehouseLM.globalFarm(globalFarmId)

      const potAddress = accountResolver(Number(globalFarmId), isXyk).toString()

      const yieldFarm = yieldFarmRaw.unwrap()
      const globalFarm = globalFarmRaw.unwrap()
      const rewardCurrency = globalFarm.rewardCurrency.toString()
      const incentivizedAsset = globalFarm.incentivizedAsset.toString()

      const balance = await getTokenBalance(
        balanceClient,
        potAddress,
        rewardCurrency,
      )()

      const price = !isXyk
        ? await getOraclePrice(api, rewardCurrency, incentivizedAsset)()
        : undefined

      const farmDetails = getFarmApr(
        parachainBlockNumber.toBigNumber(),
        {
          globalFarm,
          yieldFarm,
        },
        price?.oraclePrice ?? globalFarm.priceAdjustment.toBigNumber(),
        isXyk,
        balance.freeBalance,
      )

      const loyaltyCurve = yieldFarm.loyaltyCurve.unwrap()
      const meta = getAsset(rewardCurrency)

      return {
        poolId,
        yieldFarmId,
        globalFarmId,
        isActive,
        apr: farmDetails.apr.toFixed(2),
        rewardCurrency,
        incentivizedAsset,
        minDeposit: globalFarm.minDeposit.toString(),
        blocksPerPeriod: globalFarm.blocksPerPeriod.toString(),
        plannedYieldingPeriods: globalFarm.plannedYieldingPeriods.toString(),
        estimatedEndBlock: farmDetails.estimatedEndBlock.toString(),
        loyaltyCurve: {
          initialRewardPercentage:
            loyaltyCurve.initialRewardPercentage.toString(),
          scaleCoef: loyaltyCurve.scaleCoef.toString(),
        },
        fullness: farmDetails.fullness.toFixed(2),
        diffRewards: farmDetails.distributedRewards
          .div(farmDetails.potMaxRewards)
          .times(100)
          .toFixed(2),
        maxRewards: t("value.compact", {
          value: scaleHuman(farmDetails.potMaxRewards, meta.decimals),
        }),
        distributedRewards: t("value.compact", {
          value: scaleHuman(farmDetails.distributedRewards, meta.decimals),
        }),
      }
    })

    return await Promise.all(farmsData)
  }

const select = (data: TFarmAprData[] | undefined) => {
  return data?.reduce<Map<string, { farms: TFarmAprData[]; totalApr: string }>>(
    (map, res) => {
      if (!map.has(res.poolId)) {
        map.set(res.poolId, { farms: [res], totalApr: res.apr })
      } else {
        const existingEntry = map.get(res.poolId)!
        const newTotalApr = BN(existingEntry.totalApr).plus(res.apr).toString()

        existingEntry.farms.push(res)
        existingEntry.totalApr = newTotalApr
      }
      return map
    },
    new Map(),
  )
}

export const useOmnipoolFarm = (id?: string) => {
  const { api, sdk, isLoaded } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()

  const { client } = sdk

  const { data: activeFarms, isSuccess: isActiveFarms } = useQuery(
    QUERY_KEYS.omnipoolActiveFarm(id),
    id ? getActiveFarms(api) : noop,
    { enabled: !!id && isLoaded, staleTime: millisecondsInMinute },
  )

  const { data: activeFarmsData = [], isInitialLoading } = useQuery(
    QUERY_KEYS.omnipoolFarm(id),
    activeFarms
      ? getFarmsData(api, client.balance, activeFarms, getAssetWithFallback)
      : undefinedNoop,
    {
      enabled: isActiveFarms && isLoaded,
      staleTime: millisecondsInMinute,
    },
  )

  return { data: select(activeFarmsData)?.get(id ?? ""), isInitialLoading }
}

export const useOmnipoolFarms = (ids: string[]) => {
  const { account } = useAccount()
  const { api, sdk, isLoaded } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { data } = useAccountAssets()
  const { client } = sdk

  const balanceClient = client?.balance

  const { omnipoolDeposits = [] } = data ?? {}

  const { data: activeFarms, isSuccess: isActiveFarms } = useQuery(
    QUERY_KEYS.omnipoolActiveFarms,
    getActiveFarms(api),
    { enabled: !!ids.length && isLoaded, staleTime: millisecondsInMinute },
  )

  const stoppedFarms = useMemo(
    () => getStoppedFarms(omnipoolDeposits, activeFarms ?? []),
    [activeFarms, omnipoolDeposits],
  )

  const { data: stoppedFarmsData = [] } = useQuery(
    QUERY_KEYS.stoppedOmnipoolFarms(account?.address),
    getFarmsData(api, balanceClient, stoppedFarms, getAssetWithFallback),
    {
      enabled:
        !!balanceClient &&
        isActiveFarms &&
        isLoaded &&
        !!account?.address &&
        !!stoppedFarms.length,
      staleTime: millisecondsInMinute,
    },
  )

  const { data: activeFarmsData = [], isLoading } = useQuery(
    QUERY_KEYS.omnipoolFarms,
    activeFarms
      ? getFarmsData(api, balanceClient, activeFarms, getAssetWithFallback)
      : undefinedNoop,
    {
      enabled: isActiveFarms && isLoaded,
      staleTime: millisecondsInMinute,
    },
  )

  return { data: select([...activeFarmsData, ...stoppedFarmsData]), isLoading }
}

export const useXYKFarms = (ids: string[]) => {
  const { account } = useAccount()
  const { api, sdk, isLoaded } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { data } = useAccountAssets()
  const { client } = sdk

  const balanceClient = client?.balance

  const { xykDeposits = [] } = data ?? {}

  const { data: activeFarms, isSuccess: isActiveFarms } = useQuery(
    QUERY_KEYS.xykActiveFarms,
    getActiveFarms(api, true),
    { enabled: !!ids.length && isLoaded, staleTime: millisecondsInMinute },
  )

  const stoppedFarms = useMemo(
    () => getStoppedFarms(xykDeposits, activeFarms ?? []),
    [activeFarms, xykDeposits],
  )

  const { data: stoppedFarmsData = [] } = useQuery(
    QUERY_KEYS.stoppedXykFarms(account?.address),
    getFarmsData(api, balanceClient, stoppedFarms, getAssetWithFallback, true),
    {
      enabled:
        !!balanceClient &&
        isActiveFarms &&
        isLoaded &&
        !!account?.address &&
        !!stoppedFarms.length,
      staleTime: millisecondsInMinute,
    },
  )

  const { data: activeFarmsData = [], isLoading } = useQuery(
    QUERY_KEYS.xykFarms,
    activeFarms
      ? getFarmsData(
          api,
          client.balance,
          activeFarms,
          getAssetWithFallback,
          true,
        )
      : undefinedNoop,
    {
      enabled: isActiveFarms && isLoaded,
      staleTime: millisecondsInMinute,
    },
  )

  return { data: select([...activeFarmsData, ...stoppedFarmsData]), isLoading }
}

export const useFarmCurrentPeriod = () => {
  const { relaychainBlockNumber } = useBestNumber().data ?? {}

  const getCurrentPeriod = (blocksPerPeriod: string) =>
    relaychainBlockNumber
      ? relaychainBlockNumber.toBigNumber().dividedToIntegerBy(blocksPerPeriod)
      : undefined

  const getSecondsToLeft = (estimatedEndBlock: string) =>
    relaychainBlockNumber
      ? BN(estimatedEndBlock)
          .minus(relaychainBlockNumber.toString())
          .times(BLOCK_TIME)
      : undefined

  return { getCurrentPeriod, getSecondsToLeft }
}

function getGlobalRewardPerPeriod(
  totalSharesZ: BigNumber,
  yieldPerPeriod: BigNumber,
  maxRewardPerPeriod: BigNumber,
  priceAdjustemnt: BigNumber,
) {
  const globalRewardPerPeriod_ = totalSharesZ
    .times(yieldPerPeriod)
    .shiftedBy(-18)

  const globalRewardPerPeriod = globalRewardPerPeriod_
    .times(priceAdjustemnt)
    .shiftedBy(-18)

  const isFarmFull = globalRewardPerPeriod.gte(maxRewardPerPeriod)

  return isFarmFull ? maxRewardPerPeriod : globalRewardPerPeriod
}

function getPoolYieldPerPeriod(
  globalRewardPerPeriod: BigNumber,
  multiplier: BigNumber,
  totalSharesZ: BigNumber,
  priceAdjustemnt: BigNumber,
) {
  return globalRewardPerPeriod
    .times(multiplier)
    .div(totalSharesZ.times(priceAdjustemnt).shiftedBy(-18))
}

function getFarmApr(
  relayBlockNumber: BigNumber,
  farm: {
    globalFarm: PalletLiquidityMiningGlobalFarmData
    yieldFarm: PalletLiquidityMiningYieldFarmData
  },
  priceAdjustment: BigNumber,
  isXyk: boolean,
  potBalance?: string,
) {
  const { globalFarm, yieldFarm } = farm
  const { rewardCurrency, incentivizedAsset } = globalFarm

  const loyaltyFactor = yieldFarm.loyaltyCurve.isNone
    ? null
    : yieldFarm.loyaltyCurve
        .unwrap()
        .initialRewardPercentage.toBigNumber()
        .shiftedBy(-18)

  const loyaltyCurve = yieldFarm.loyaltyCurve.unwrapOr(null)
  const totalSharesZ = globalFarm.totalSharesZ.toBigNumber()
  const plannedYieldingPeriods = globalFarm.plannedYieldingPeriods.toBigNumber()
  const yieldPerPeriod = globalFarm.yieldPerPeriod.toBigNumber()

  const maxRewardPerPeriod = globalFarm.maxRewardPerPeriod.toBigNumber()
  const blocksPerPeriod = globalFarm.blocksPerPeriod.toBigNumber()
  const currentPeriod = relayBlockNumber.dividedToIntegerBy(blocksPerPeriod)
  const blockTime = BLOCK_TIME
  const multiplier = yieldFarm.multiplier.toBigNumber().shiftedBy(-18)
  const secondsPerYear = new BigNumber(secondsInYear)
  const periodsPerYear = secondsPerYear.div(blockTime.times(blocksPerPeriod))

  let apr
  if (totalSharesZ.isZero()) {
    apr = yieldPerPeriod.times(multiplier).times(periodsPerYear).shiftedBy(-18)
  } else {
    const globalRewardPerPeriod = getGlobalRewardPerPeriod(
      totalSharesZ,
      yieldPerPeriod,
      maxRewardPerPeriod,
      priceAdjustment,
    )
    const poolYieldPerPeriod = getPoolYieldPerPeriod(
      globalRewardPerPeriod,
      multiplier,
      totalSharesZ,
      priceAdjustment,
    )

    apr = poolYieldPerPeriod.times(periodsPerYear)
  }

  // max distribution of rewards
  // https://www.notion.so/Screen-elements-mapping-Farms-baee6acc456542ca8d2cccd1cc1548ae?p=4a2f16a9f2454095945dbd9ce0eb1b6b&pm=s
  const distributedRewards = globalFarm.pendingRewards
    .toBigNumber()
    .plus(globalFarm.accumulatedPaidRewards.toBigNumber())

  const maxRewards = maxRewardPerPeriod.times(plannedYieldingPeriods)
  const potMaxRewards = potBalance
    ? distributedRewards.plus(potBalance)
    : maxRewards

  const leftToDistribute = potMaxRewards.minus(distributedRewards)

  // estimate, when the farm will most likely distribute all the rewards
  const updatedAtPeriod = globalFarm.updatedAt.toBigNumber()
  const periodsLeft = leftToDistribute.div(maxRewardPerPeriod)

  // if there are no deposits, the farm is not running and distributing rewards
  const estimatedEndPeriod = totalSharesZ.gte(0)
    ? updatedAtPeriod.plus(periodsLeft)
    : currentPeriod.plus(periodsLeft)

  const estimatedEndBlock = estimatedEndPeriod.times(blocksPerPeriod)

  // fullness of the farm
  // interpreted as how close are we to the cap of yield per period
  // https://www.notion.so/FAQ-59697ce6fd2e46e1b8f9093ba4606e88#446ee616be484c5e86e5eb82d3a29455

  const fullness = totalSharesZ
    .div(maxRewardPerPeriod.div(yieldPerPeriod))
    .shiftedBy(-18)
    .times(100)
    .times(priceAdjustment.shiftedBy(-18))

  const isDistributed = distributedRewards.div(potMaxRewards).gte(0.999)

  // multiply by 100 since APR should be a percentage
  apr = isDistributed ? BN_0 : apr.div(isXyk ? 2 : 1).times(100)

  const minApr = loyaltyFactor ? apr.times(loyaltyFactor) : null

  return {
    apr,
    minApr,
    distributedRewards,
    potMaxRewards,
    fullness,
    estimatedEndBlock,
    assetId: globalFarm.rewardCurrency,
    currentPeriod,
    loyaltyCurve,
    rewardCurrency,
    incentivizedAsset,
    yieldFarmId: yieldFarm.id.toString(),
    isDistributed,
  }
}

export const useOraclePrice = (
  rewardCurrency: string | undefined,
  incentivizedAsset: string | undefined,
) => {
  const { api, isLoaded } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.oraclePrice(rewardCurrency, incentivizedAsset),
    rewardCurrency != null && incentivizedAsset != null
      ? getOraclePrice(api, rewardCurrency, incentivizedAsset)
      : undefinedNoop,
    {
      enabled: rewardCurrency != null && incentivizedAsset != null && isLoaded,
    },
  )
}

const getOraclePrice =
  (api: ApiPromise, rewardCurrency: string, incentivizedAsset: string) =>
  async () => {
    const orderedAssets = [rewardCurrency, incentivizedAsset].sort(
      (a, b) => Number(a) - Number(b),
    ) as [string, string]

    if (rewardCurrency === incentivizedAsset)
      return {
        id: { rewardCurrency, incentivizedAsset },
        oraclePrice: scale(BN_1, "q"),
      }
    const res = await api.query.emaOracle.oracles(
      "omnipool",
      orderedAssets,
      "TenMinutes",
    )

    if (res.isNone)
      return {
        id: { rewardCurrency, incentivizedAsset },
        oraclePrice: undefined,
      }

    const [data] = res.unwrap()
    const n = data.price.n.toString()
    const d = data.price.d.toString()

    let oraclePrice
    if (Number(rewardCurrency) < Number(incentivizedAsset)) {
      oraclePrice = fixed_from_rational(n, d)
    } else {
      oraclePrice = fixed_from_rational(d, n)
    }

    return {
      id: { rewardCurrency, incentivizedAsset },
      oraclePrice: BN(oraclePrice),
      price: { n, d },
    }
  }

export const useFarmsPoolAssets = () => {
  const indexerUrl = useIndexerUrl()
  const { api } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.yieldFarmCreated,
    async () => {
      const currentBlockNumber = await api.derive.chain.bestNumber()
      const latestBlockNumber = currentBlockNumber
        .toBigNumber()
        .plus(NEW_YIELD_FARMS_BLOCKS)
        .toNumber()

      const { events } = await getYieldFarmCreated(
        indexerUrl,
        latestBlockNumber,
      )()

      const newFarmsByPoolAsset = new Set<number>()

      events.forEach(({ args: { assetId } }) => {
        if (!newFarmsByPoolAsset.has(assetId)) {
          newFarmsByPoolAsset.add(assetId)
        }
      })

      return [...newFarmsByPoolAsset.values()]
    },
    { staleTime: Infinity, cacheTime: Infinity },
  )
}

export const getYieldFarmCreated =
  (indexerUrl: string, blockNumber: number) => async () => {
    return {
      ...(await request<{
        events: Array<{
          args: { assetId: number }
        }>
      }>(
        indexerUrl,
        gql`
          query YieldFarmCreated($blockNumber: Int) {
            events(
              where: {
                name_eq: "OmnipoolLiquidityMining.YieldFarmCreated"
                block: { height_gte: $blockNumber }
              }
            ) {
              args
            }
          }
        `,
        { blockNumber },
      )),
    }
  }

export const useRefetchClaimableFarmValues = () => {
  const { account } = useAccount()
  const queryClient = useQueryClient()

  return () => {
    queryClient.resetQueries(
      QUERY_KEYS.accountClaimableFarmValues(account?.address),
    )
  }
}

export const useAccountClaimableFarmValues = () => {
  const { api, isLoaded } = useRpcProvider()
  const { tokens, erc20, getAssetWithFallback } = useAssets()
  const { data } = useAccountAssets()

  const {
    omnipoolDeposits = [],
    xykDeposits = [],
    depositLiquidityPositions = [],
    accountAddress,
  } = data ?? {}
  const allDeposits = [...omnipoolDeposits, ...xykDeposits]

  return useQuery(
    QUERY_KEYS.accountClaimableFarmValues(accountAddress),
    async () => {
      const accountResolver = getAccountResolver(api.registry)

      const relayChainBlockNumber = (
        await api.query.parachainSystem.validationData()
      )
        .unwrap()
        .relayParentNumber.toBigNumber()

      const queries = allDeposits.flatMap((deposit) => {
        const poolId = deposit.data.ammPoolId.toString()
        const isXyk = deposit.isXyk

        return deposit.data.yieldFarmEntries.map(async (farmEntry) => {
          const globalFarmId = farmEntry.globalFarmId.toString()
          const yieldFarmId = farmEntry.yieldFarmId.toString()

          const yieldFarmRaw = isXyk
            ? await api.query.xykWarehouseLM.yieldFarm(
                poolId,
                globalFarmId,
                yieldFarmId,
              )
            : await api.query.omnipoolWarehouseLM.yieldFarm(
                poolId,
                globalFarmId,
                yieldFarmId,
              )
          const globalFarmRaw = isXyk
            ? await api.query.xykWarehouseLM.globalFarm(globalFarmId)
            : await api.query.omnipoolWarehouseLM.globalFarm(globalFarmId)

          const globalFarm = globalFarmRaw.unwrap()
          const yieldFarm = yieldFarmRaw.unwrap()
          const rewardCurrency = globalFarm.rewardCurrency.toString()
          const incentivizedAsset = globalFarm.incentivizedAsset.toString()

          const loyaltyCurve = yieldFarm.loyaltyCurve.unwrap()

          const currentPeriod = relayChainBlockNumber.dividedToIntegerBy(
            globalFarm.blocksPerPeriod.toString(),
          )

          const currentPeriodInFarm = BN(currentPeriod).minus(
            farmEntry.enteredAt.toString(),
          )
          const loyaltyFactor = getCurrentLoyaltyFactor(
            {
              initialRewardPercentage:
                loyaltyCurve.initialRewardPercentage.toString(),
              scaleCoef: loyaltyCurve.scaleCoef.toString(),
            },
            currentPeriodInFarm,
          )

          const accountAddresses: Array<[address: AccountId32, assetId: u32]> =
            [
              [accountResolver(0, isXyk), globalFarm.rewardCurrency],
              [
                accountResolver(globalFarm.id, isXyk),
                globalFarm.rewardCurrency,
              ],
            ]

          const balances = await getAccountAssetBalances(
            api,
            accountAddresses,
          )()
          const oracles = await getOraclePrice(
            api,
            rewardCurrency,
            incentivizedAsset,
          )()

          const multiCurrency = new MultiCurrencyContainer(
            accountAddresses,
            balances,
          )

          const simulator = new OmnipoolLiquidityMiningClaimSim(
            getAccountResolver(api.registry),
            multiCurrency,
            [...tokens, ...erc20],
          )

          const { globalFarm: mutableGlobalFarm, yieldFarm: mutableYieldFarm } =
            createMutableFarmEntry({ globalFarm, yieldFarm })

          const reward = simulator.claim_rewards(
            mutableGlobalFarm,
            mutableYieldFarm,
            farmEntry,
            relayChainBlockNumber,
            oracles.oraclePrice ?? globalFarm.priceAdjustment.toBigNumber(),
          )

          if (reward) {
            const meta = getAssetWithFallback(reward.assetId)

            if (reward.reward.lte(meta.existentialDeposit)) return undefined

            const liquidityPositionId = isXyk
              ? undefined
              : depositLiquidityPositions.find(
                  (lp) => lp.depositId === deposit.id,
                )

            const isClaimable = true

            const isActiveFarm = yieldFarm.state.isActive

            return {
              poolId,
              rewardCurrency: reward.assetId,
              value: scaleHuman(reward.reward, meta.decimals).toFixed(8),
              claimableValue: !isClaimable
                ? "0"
                : scaleHuman(reward.reward, meta.decimals).toFixed(8),
              maxValue: scaleHuman(reward.maxReward, meta.decimals).toFixed(8),
              yieldFarmId,
              globalFarmId,
              depositId: deposit.id,
              isXyk,
              liquidityPositionId: liquidityPositionId?.id,
              shares: deposit.data.shares.toString(),
              loyaltyFactor,
              isClaimable,
              isActiveFarm,
            }
          }

          return undefined
        })
      })

      return await Promise.all(queries)
    },
    {
      select: (data) =>
        data.reduce<Map<string, Array<TClaimableFarmValue>>>((map, res) => {
          if (res) {
            if (!map.has(res.poolId)) {
              map.set(res.poolId, [res])
            } else {
              const existingEntry = map.get(res.poolId)!

              existingEntry.push(res)
            }
          }

          return map
        }, new Map()),
      enabled: isLoaded && !!allDeposits.length && !!accountAddress,
      staleTime: millisecondsInHour,
      refetchInterval: millisecondsInMinute,
    },
  )
}

export const useSummarizeClaimableValues = (
  claimableValues: TClaimableFarmValue[],
) => {
  const assetsId = Array.from(
    new Set(
      claimableValues.map((claimableValue) => claimableValue.rewardCurrency),
    ),
  )

  const { getAssetPrice, isLoading } = useAssetsPrice(assetsId)

  const {
    total,
    maxTotal,
    claimableTotal,
    claimableAssetValues,
    totalsByYieldFarms,
  } = useMemo(() => {
    if (isLoading) {
      return {
        total: "0",
        maxTotal: "0",
        claimableTotal: "0",
        claimableAssetValues: {},
        totalsByYieldFarms: [],
      }
    }

    return claimableValues.reduce<{
      total: string
      claimableTotal: string
      maxTotal: string
      claimableAssetValues: Record<
        string,
        {
          rewards: string
          claimableRewards: string
          maxRewards: string
        }
      >
      totalsByYieldFarms: Array<{
        yieldFarmId: string
        total: string
        claimableTotal: string
        maxTotal: string
        assetId: string
      }>
    }>(
      (acc, farm) => {
        const { rewardCurrency, value, maxValue, claimableValue, yieldFarmId } =
          farm

        if (!acc.claimableAssetValues[rewardCurrency]) {
          acc.claimableAssetValues[rewardCurrency] = {
            rewards: "0",
            maxRewards: "0",
            claimableRewards: "0",
          }
        }

        const rewards = BN(value)
        const claimableRewards = BN(claimableValue)
        const maxRewards = BN(maxValue)

        acc.claimableAssetValues[rewardCurrency].rewards = new BN(
          acc.claimableAssetValues[rewardCurrency].rewards,
        )
          .plus(rewards)
          .toString()

        acc.claimableAssetValues[rewardCurrency].claimableRewards = new BN(
          acc.claimableAssetValues[rewardCurrency].claimableRewards,
        )
          .plus(claimableRewards)
          .toString()

        acc.claimableAssetValues[rewardCurrency].maxRewards = new BN(
          acc.claimableAssetValues[rewardCurrency].maxRewards,
        )
          .plus(maxRewards)
          .toString()

        const spotPrice = getAssetPrice(rewardCurrency).price

        if (spotPrice) {
          const rewardTotal = rewards.times(spotPrice).toString()
          const claimableRewardTotal = claimableRewards
            .times(spotPrice)
            .toString()
          const maxRewardTotal = maxRewards.times(spotPrice).toString()

          acc.total = BN(acc.total).plus(rewardTotal).toString()
          acc.claimableTotal = BN(acc.claimableTotal)
            .plus(claimableRewardTotal)
            .toString()
          acc.maxTotal = BN(acc.maxTotal).plus(maxRewardTotal).toString()

          acc.totalsByYieldFarms.push({
            yieldFarmId,
            total: rewardTotal,
            claimableTotal: claimableRewardTotal,
            maxTotal: maxRewardTotal,
            assetId: rewardCurrency,
          })
        }

        return acc
      },
      {
        total: "0",
        claimableTotal: "0",
        maxTotal: "0",
        claimableAssetValues: {},
        totalsByYieldFarms: [],
      },
    )
  }, [claimableValues, getAssetPrice, isLoading])

  const diffRewards = BN(maxTotal).minus(claimableTotal).toString()

  return {
    total,
    claimableTotal,
    maxTotal,
    diffRewards,
    claimableAssetValues,
    totalsByYieldFarms,
    isLoading,
  }
}

export const getTotalAPR = (farms: TFarmAprData[]) => {
  const aprs = farms.map(({ apr }) => apr)

  return aprs.reduce((acc, apr) => acc.plus(apr), BN_0)
}
