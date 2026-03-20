import {
  DEFAULT_NULL_VALUE_ON_TX,
  ProtocolAction,
} from "@aave/contract-helpers"
import { Web3Provider } from "@ethersproject/providers"
import { pureCreatedEventsQuery } from "@galacticcouncil/indexer/indexer"
import { ExtendedFormattedUser } from "@galacticcouncil/money-market/hooks"
import { ExternalApyData } from "@galacticcouncil/money-market/types"
import {
  AaveV3HydrationMainnet,
  gasLimitRecommendations,
} from "@galacticcouncil/money-market/ui-config"
import {
  formatGhoReserveData,
  formatGhoUserData,
  formatReserveIncentives,
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
  getGhoBorrowApyRange,
  getUserApyValues,
  GhoService,
  IncentivesControllerV2,
} from "@galacticcouncil/money-market/utils"
import {
  GDOT_ASSET_ID,
  getAddressFromAssetId,
  PRIME_ASSET_ID,
  safeConvertAnyToH160,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import {
  QueryClient,
  queryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import Big from "big.js"
import { produce } from "immer"
import { Binary, FixedSizeArray } from "polkadot-api"
import { useCallback } from "react"

import {
  borrowIncentivesContractQuery,
  borrowPoolDataContractQuery,
  ghoServiceContractQuery,
  useBorrowPoolContract,
  useGhoServiceContract,
} from "@/api/borrow/contracts"
import { borrowAssetApyQuery } from "@/api/borrow/hooks"
import { bestNumberQuery, useBlockTimestamp } from "@/api/chain"
import {
  ASSET_ID_TO_DEFILLAMA_ID,
  defillamaLatestApyQuery,
} from "@/api/external/defillama"
import { ASSET_ID_TO_KAMINO_ID, kaminoApyQuery } from "@/api/external/kamino"
import { TProviderData, useSquidClient } from "@/api/provider"
import { useIndexerClient } from "@/api/provider"
import { getAccountProxies } from "@/api/proxy"
import { useAssets } from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

export const lendingPoolAddressProvider =
  AaveV3HydrationMainnet.POOL_ADDRESSES_PROVIDER

export const borrowIncentivesQuery = (
  rpc: TProviderContext,
  queryClient: QueryClient,
) =>
  queryOptions({
    queryKey: ["borrow", "incentives", lendingPoolAddressProvider],
    queryFn: async () => {
      const incentivesContract = await queryClient.ensureQueryData(
        borrowIncentivesContractQuery(rpc.evm, rpc.isLoaded),
      )
      if (!incentivesContract) throw new Error("Invalid incentivesContract")

      const incentives =
        await incentivesContract.getReservesIncentivesDataHumanized({
          lendingPoolAddressProvider,
        })

      return formatReserveIncentives(incentives)
    },
    retry: false,
    enabled: !!lendingPoolAddressProvider,
  })

export const useBorrowIncentives = () => {
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()

  return useQuery(borrowIncentivesQuery(rpc, queryClient))
}

export const borrowReservesQuery = (
  rpc: TProviderContext,
  queryClient: QueryClient,
  timestamp: bigint,
) =>
  queryOptions({
    queryKey: ["borrow", "reserves", lendingPoolAddressProvider],
    queryFn: async () => {
      const poolDataContract = await queryClient.ensureQueryData(
        borrowPoolDataContractQuery(rpc.evm, rpc.isLoaded),
      )

      if (!poolDataContract) throw new Error("Invalid poolDataContract")

      const [reserves, reserveIncentives] = await Promise.all([
        poolDataContract.getReservesHumanized({
          lendingPoolAddressProvider,
        }),
        queryClient.ensureQueryData(borrowIncentivesQuery(rpc, queryClient)),
      ])

      const { baseCurrencyData, reservesData } = reserves
      const currentTimestamp = Number(timestamp) / 1000

      const formattedReserves = formatReservesAndIncentives({
        currentTimestamp,
        reserves: reservesData,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        reserveIncentives: reserveIncentives ?? [],
      }).map((r) => ({
        ...r,
        iconSymbol: r.symbol,
        isEmodeEnabled: r.eModeCategoryId !== 0,
        isWrappedBaseAsset: false,
      }))

      return {
        formattedReserves,
        baseCurrencyData,
      }
    },
    retry: false,
    enabled: !!lendingPoolAddressProvider && timestamp > 0n,
  })

export const useBorrowReserves = () => {
  const queryClient = useQueryClient()
  const { data: timestamp } = useBlockTimestamp()
  const rpc = useRpcProvider()

  return useQuery(borrowReservesQuery(rpc, queryClient, timestamp ?? 0n))
}

export const userBorrowReservesQuery = (
  rpc: TProviderContext,
  queryClient: QueryClient,
  evmAddress: string,
) =>
  queryOptions({
    queryKey: [
      "borrow",
      "userReserves",
      evmAddress,
      lendingPoolAddressProvider,
    ],
    queryFn: async () => {
      const poolDataContract = await queryClient.ensureQueryData(
        borrowPoolDataContractQuery(rpc.evm, rpc.isLoaded),
      )
      if (!poolDataContract) throw new Error("Invalid poolDataContract")

      return poolDataContract.getUserReservesHumanized({
        lendingPoolAddressProvider,
        user: evmAddress,
      })
    },
    retry: false,
    enabled: !!evmAddress,
  })

export const useUserBorrowReserves = (givenAddress?: string) => {
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()

  const { account } = useAccount()

  const address = givenAddress || account?.address || ""
  const evmAddress = safeConvertAnyToH160(address)

  return useQuery(userBorrowReservesQuery(rpc, queryClient, evmAddress))
}

export const borrowUserIncentivesQuery = (
  rpc: TProviderContext,
  evmAddress: string,
  queryClient: QueryClient,
) =>
  queryOptions({
    queryKey: [
      "borrow",
      "userIncentives",
      evmAddress,
      lendingPoolAddressProvider,
    ],
    queryFn: async () => {
      const incentivesContract = await queryClient.ensureQueryData(
        borrowIncentivesContractQuery(rpc.evm, rpc.isLoaded),
      )
      if (!incentivesContract) throw new Error("Invalid incentivesContract")

      return incentivesContract.getUserReservesIncentivesDataHumanized({
        lendingPoolAddressProvider,
        user: evmAddress,
      })
    },
    retry: false,
    enabled: !!evmAddress,
  })

export const useBorrowUserIncentives = (givenAddress?: string) => {
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()
  const { account } = useAccount()

  const address = givenAddress || account?.address || ""

  const evmAddress = safeConvertAnyToH160(address)

  return useQuery(borrowUserIncentivesQuery(rpc, evmAddress, queryClient))
}

export const ghoReserveDataQuery = (
  ghoServiceContract: GhoService | null | undefined,
) =>
  queryOptions({
    queryKey: ["borrow", "gho", "data"],
    queryFn: async () => {
      if (!ghoServiceContract) throw new Error("Invalid ghoServiceContract")

      const ghoReserveData = await ghoServiceContract.getGhoReserveData()
      const formattedGhoReserveData = formatGhoReserveData({ ghoReserveData })
      return {
        ghoReserveData,
        formattedGhoReserveData,
        ghoBorrowApyRange: getGhoBorrowApyRange(formattedGhoReserveData),
      }
    },
    retry: false,
    enabled: !!ghoServiceContract,
  })

export const useGhoReserveData = () => {
  const ghoServiceContract = useGhoServiceContract()
  return useQuery(ghoReserveDataQuery(ghoServiceContract))
}

export const ghoUserDataQuery = (
  rpc: TProviderContext,
  queryClient: QueryClient,
  evmAddress: string,
  timestamp: bigint,
) =>
  queryOptions({
    queryKey: ["borrow", "gho", "userData", evmAddress],
    queryFn: async () => {
      const ghoServiceContract = await queryClient.ensureQueryData(
        ghoServiceContractQuery(rpc.evm, rpc.isLoaded),
      )
      if (!ghoServiceContract) throw new Error("Invalid ghoServiceContract")

      if (timestamp <= 0n) throw new Error("Invalid timestamp")

      const [{ ghoReserveData, formattedGhoReserveData }, ghoUserData] =
        await Promise.all([
          queryClient.ensureQueryData(ghoReserveDataQuery(ghoServiceContract)),
          ghoServiceContract.getGhoUserData(evmAddress),
        ])

      const currentTimestamp = Number(timestamp) / 1000

      return {
        formattedGhoReserveData,
        formattedGhoUserData: formatGhoUserData({
          ghoReserveData,
          ghoUserData,
          currentTimestamp,
        }),
      }
    },
    retry: false,
    enabled: !!evmAddress && timestamp > 0n,
  })

export const useGhoUserData = (evmAddress: string) => {
  const { data: timestamp } = useBlockTimestamp()
  const queryClient = useQueryClient()
  const rpc = useRpcProvider()

  return useQuery(
    ghoUserDataQuery(rpc, queryClient, evmAddress, timestamp ?? 0n),
  )
}

export const userBorrowSummaryQueryKey = (
  evmAddress: string,
  withExternalApy: boolean,
) => [
  "borrow",
  "userSummary",
  evmAddress,
  lendingPoolAddressProvider,
  withExternalApy,
]

export const userBorrowSummaryQuery = (
  rpc: TProviderContext,
  evmAddress: string,
  queryClient: QueryClient,
  timestamp: bigint,
  externalApyData?: ExternalApyData,
) =>
  queryOptions({
    queryKey: userBorrowSummaryQueryKey(evmAddress, !!externalApyData),
    queryFn: async () => {
      if (!timestamp || timestamp <= 0n) throw new Error("Invalid timestamp")

      const [user, reserves, reserveIncentives, userIncentives, gho] =
        await Promise.all([
          queryClient.ensureQueryData(
            userBorrowReservesQuery(rpc, queryClient, evmAddress),
          ),
          queryClient.ensureQueryData(
            borrowReservesQuery(rpc, queryClient, timestamp),
          ),
          queryClient.ensureQueryData(borrowIncentivesQuery(rpc, queryClient)),
          queryClient.ensureQueryData(
            borrowUserIncentivesQuery(rpc, evmAddress, queryClient),
          ),
          queryClient.ensureQueryData(
            ghoUserDataQuery(rpc, queryClient, evmAddress, timestamp),
          ),
        ])

      const { userEmodeCategoryId, userReserves } = user
      const { formattedGhoUserData, formattedGhoReserveData } = gho

      const currentTimestamp = Number(timestamp) / 1000

      const formattedReserves = externalApyData
        ? produce(reserves.formattedReserves, (draft) => {
            const reserveMap = new Map(draft.map((r) => [r.underlyingAsset, r]))

            for (const [assetId, data] of externalApyData.entries()) {
              const reserve = reserveMap.get(getAddressFromAssetId(assetId))
              if (reserve) {
                reserve.supplyAPY = data.supplyApy
                reserve.variableBorrowAPY = data.borrowApy
              }
            }
          })
        : reserves.formattedReserves

      const summary = formatUserSummaryAndIncentives({
        currentTimestamp,
        marketReferencePriceInUsd:
          reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves,
        formattedReserves,
        userEmodeCategoryId,
        reserveIncentives,
        userIncentives,
      })

      const extendedUser: ExtendedFormattedUser = {
        ...summary,
        ...getUserApyValues(
          summary,
          formattedReserves,
          formattedGhoUserData,
          formattedGhoReserveData,
        ),
        isInEmode: userEmodeCategoryId !== 0,
        userEmodeCategoryId,
      }

      return extendedUser
    },
    retry: false,
    enabled: !!evmAddress && timestamp > 0n,
  })

export const useUserBorrowSummary = (givenAddress?: string) => {
  const queryClient = useQueryClient()
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { data: timestamp } = useBlockTimestamp()

  const address = givenAddress || account?.address || ""
  const evmAddress = safeConvertAnyToH160(address)

  return useQuery(
    userBorrowSummaryQuery(rpc, evmAddress, queryClient, timestamp ?? 0n),
  )
}

export const useUsersBorrowSummary = (addresses: string[]) => {
  const queryClient = useQueryClient()
  const rpc = useRpcProvider()
  const { data: timestamp } = useBlockTimestamp()

  return useQueries({
    queries: addresses.map((address) => {
      const evmAddress = safeConvertAnyToH160(address || "")

      return userBorrowSummaryQuery(
        rpc,
        evmAddress,
        queryClient,
        timestamp ?? 0n,
      )
    }),
  })
}

export const useGetClaimAllBorrowRewardsTx = () => {
  const { papi, evm } = useRpcProvider()
  const { account } = useAccount()
  const { data: user } = useUserBorrowSummary()

  return useCallback(async () => {
    const address = account?.address || ""
    const evmAddress = safeConvertAnyToH160(address)

    const incentivesTxBuilderV2 = new IncentivesControllerV2(
      new Web3Provider(evm.transport),
    )

    const userIncentive = user
      ? Object.values(user.calculatedUserIncentives)[0]
      : undefined

    const incentivesControllerAddress =
      userIncentive?.incentiveControllerAddress

    if (!evmAddress) throw new Error("Invalid EVM account address")
    if (!user?.userReservesData) throw new Error("User reserves not found")
    if (!incentivesControllerAddress)
      throw new Error("Incentive controller address not found")

    const assets = user.userReservesData.reduce<string[]>(
      (acc, { reserve }) => {
        return acc.concat(
          reserve.aIncentivesData?.length ? [reserve.aTokenAddress] : [],
          reserve.vIncentivesData?.length
            ? [reserve.variableDebtTokenAddress]
            : [],
          reserve.sIncentivesData?.length
            ? [reserve.stableDebtTokenAddress]
            : [],
        )
      },
      [],
    )

    const call = incentivesTxBuilderV2.claimAllRewards({
      user: evmAddress,
      to: evmAddress,
      assets,
      incentivesControllerAddress,
    })

    const tx = await call?.find((tx) => tx.txType === "REWARD_ACTION")?.tx()

    if (!tx || !tx.from || !tx.to || !tx.data || !tx.gasLimit) {
      throw new Error("Invalid claim transaction")
    }

    const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } =
      await estimateGasLimit({
        evm,
        gasLimit: tx.gasLimit.toString(),
        action: ProtocolAction.claimRewards,
      })

    const evmCall = papi.tx.EVM.call({
      source: Binary.fromHex(tx.from),
      target: Binary.fromHex(tx.to),
      input: Binary.fromHex(tx.data),
      value: [0n, 0n, 0n, 0n],
      gas_limit: gasLimit,
      max_fee_per_gas: maxFeePerGas,
      max_priority_fee_per_gas: maxPriorityFeePerGas,
      access_list: [],
      authorization_list: [],
      nonce: undefined,
    })

    return papi.tx.Dispatcher.dispatch_evm_call({
      call: evmCall.decodedCall,
    })
  }, [account?.address, evm, papi, user])
}

export const estimateGasLimit = async ({
  evm,
  gasLimit,
  action,
}: {
  gasLimit?: string
  evm: TProviderData["evm"]
  action?: ProtocolAction
}) => {
  const gasPriceBase = await evm.getGasPrice()
  const gasPriceSurplus = (gasPriceBase * 5n) / 100n // 5% surplus
  const gasPrice = gasPriceBase + gasPriceSurplus

  const defaultGasLimit =
    gasLimit ?? gasLimitRecommendations.default?.recommended

  if (!defaultGasLimit) {
    throw new Error("Default gas limit not found")
  }

  const feePerGas = [gasPrice, 0n, 0n, 0n] as FixedSizeArray<4, bigint>

  return {
    gasLimit: BigInt(
      action
        ? gasLimitRecommendations[action]?.recommended || defaultGasLimit
        : defaultGasLimit,
    ),
    maxFeePerGas: feePerGas,
    maxPriorityFeePerGas: feePerGas,
  }
}

export const useBorrowDisableCollateralTxs = () => {
  const { evm, papi } = useRpcProvider()
  const poolContract = useBorrowPoolContract()
  const { account } = useAccount()

  const { data: userReserves } = useUserBorrowReserves()

  return useCallback(async () => {
    if (!poolContract || !account || !userReserves) return null

    const address = account?.address || ""
    const evmAddress = safeConvertAnyToH160(address)

    const activeCollaterals = userReserves.userReserves.filter(
      (reserve) => reserve.usageAsCollateralEnabledOnUser,
    )

    return await Promise.all(
      activeCollaterals.map(async (collateral) => {
        const collateralTxs = await poolContract.setUsageAsCollateral({
          reserve: collateral.underlyingAsset,
          usageAsCollateral: false,
          user: evmAddress,
        })

        const tx = await collateralTxs
          .find((tx) => "DLP_ACTION" === tx.txType)
          ?.tx()

        if (!tx || !tx.from || !tx.to || !tx.data || !tx.gasLimit) {
          throw new Error(
            `Disable collateral transaction not found for ${collateral.underlyingAsset}`,
          )
        }

        const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } =
          await estimateGasLimit({
            evm,
            gasLimit: tx.gasLimit.toString(),
            action: ProtocolAction.setUsageAsCollateral,
          })

        const evmCall = papi.tx.EVM.call({
          source: Binary.fromHex(tx.from),
          target: Binary.fromHex(tx.to),
          input: Binary.fromHex(tx.data),
          value: [0n, 0n, 0n, 0n],
          gas_limit: gasLimit,
          max_fee_per_gas: maxFeePerGas,
          max_priority_fee_per_gas: maxPriorityFeePerGas,
          access_list: [],
          authorization_list: [],
          nonce: undefined,
        })

        return evmCall
      }),
    )
  }, [poolContract, account, evm, papi, userReserves])
}

export const useSetUsageAsCollateralTx = () => {
  const { papi, evm } = useRpcProvider()
  const poolContract = useBorrowPoolContract()
  const { account } = useAccount()

  return useCallback(
    async (reserve: string, usageAsCollateral: boolean, address?: string) => {
      const evmAddress = safeConvertAnyToH160(address || account?.address || "")

      if (!evmAddress) throw new Error("Invalid EVM address")
      if (!poolContract) throw new Error("Invalid poolContract")

      const poolInstance = poolContract.getContractInstance(
        poolContract.poolAddress,
      )

      const txRaw =
        await poolInstance.populateTransaction.setUserUseReserveAsCollateral(
          reserve,
          usageAsCollateral,
        )

      const tx = {
        ...txRaw,
        from: evmAddress,
        value: DEFAULT_NULL_VALUE_ON_TX,
      }

      const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } =
        await estimateGasLimit({
          evm,
          gasLimit: tx.gasLimit?.toString(),
          action: ProtocolAction.claimRewards,
        })

      const evmCall = papi.tx.EVM.call({
        source: Binary.fromHex(tx.from),
        target: Binary.fromHex(tx.to),
        input: Binary.fromHex(tx.data),
        value: [0n, 0n, 0n, 0n],
        gas_limit: gasLimit,
        max_fee_per_gas: maxFeePerGas,
        max_priority_fee_per_gas: maxPriorityFeePerGas,
        access_list: [],
        authorization_list: [],
        nonce: undefined,
      })

      return evmCall
    },
    [poolContract, account?.address, evm, papi],
  )
}

export const useSetUserEModeTx = () => {
  const { papi, evm } = useRpcProvider()
  const poolContract = useBorrowPoolContract()
  const { account } = useAccount()

  return useCallback(
    async (categoryId: number, address?: string) => {
      const evmAddress = safeConvertAnyToH160(address || account?.address || "")

      if (!poolContract) throw new Error("Invalid poolContract")

      const poolInstance = poolContract.getContractInstance(
        poolContract.poolAddress,
      )

      const txRaw =
        await poolInstance.populateTransaction.setUserEMode(categoryId)

      const tx = {
        ...txRaw,
        from: evmAddress,
        value: DEFAULT_NULL_VALUE_ON_TX,
      }

      const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } =
        await estimateGasLimit({
          evm,
          gasLimit: tx.gasLimit?.toString(),
          action: ProtocolAction.setEModeUsage,
        })

      const evmCall = papi.tx.EVM.call({
        source: Binary.fromHex(tx.from),
        target: Binary.fromHex(tx.to),
        input: Binary.fromHex(tx.data),
        value: [0n, 0n, 0n, 0n],
        gas_limit: gasLimit,
        max_fee_per_gas: maxFeePerGas,
        max_priority_fee_per_gas: maxPriorityFeePerGas,
        access_list: [],
        authorization_list: [],
        nonce: undefined,
      })

      return evmCall
    },
    [poolContract, account?.address, evm, papi],
  )
}

export enum ExternalApyType {
  stake = "stake",
  nativeYield = "nativeYield",
}

export const useExternalApys = (assetIds: string[]) => {
  const queryConfigs = assetIds
    .map((assetId) => {
      const defillamaId = ASSET_ID_TO_DEFILLAMA_ID[assetId]
      if (defillamaId) {
        return {
          assetId,
          type: ExternalApyType.stake,
          query: {
            ...defillamaLatestApyQuery(defillamaId),
            enabled: !!defillamaId,
          },
        }
      }

      const kaminoId = ASSET_ID_TO_KAMINO_ID[assetId]
      if (kaminoId) {
        return {
          assetId,
          type: ExternalApyType.nativeYield,
          query: {
            ...kaminoApyQuery(kaminoId),
            enabled: !!kaminoId,
          },
        }
      }

      return null
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)

  const queries = queryConfigs.map((c) => c.query)

  const results = useQueries({
    queries,
  })

  return {
    isLoading: results.some((result) => result.isLoading),
    data: results.map((result, i) => {
      const queryConfig = queryConfigs[i] as NonNullable<
        (typeof queryConfigs)[number]
      >

      return [
        queryConfig.assetId,
        {
          apyType: queryConfig.type,
          apy: result.data,
        },
      ] as const
    }),
  }
}

export const useStrategyPositions = () => {
  const { account } = useAccount()
  const queryClient = useQueryClient()
  const indexerClient = useIndexerClient()
  const squidClient = useSquidClient()
  const { getAssetWithFallback, getErc20AToken, getRelatedAToken } = useAssets()
  const rpc = useRpcProvider()

  const { data: timestamp } = useBlockTimestamp()

  const accountAddress = account?.address || ""

  return useQuery(
    queryOptions({
      queryKey: ["strategyPositions", accountAddress],
      enabled: !!accountAddress && !!timestamp,
      queryFn: async () => {
        const accountProxies = await queryClient.ensureQueryData(
          getAccountProxies(rpc, queryClient, accountAddress),
        )

        const bestNumber = await queryClient.ensureQueryData(
          bestNumberQuery(rpc),
        )

        if (!bestNumber) throw new Error("Best number not found")

        const parachainBlockNumber = bestNumber.parachainBlockNumber
        const currentTimestampMs = bestNumber.timestamp

        const apys = await Promise.all(
          [PRIME_ASSET_ID, GDOT_ASSET_ID].map((assetId) =>
            queryClient.ensureQueryData(
              borrowAssetApyQuery(
                rpc,
                queryClient,
                squidClient,
                assetId,
                getAssetWithFallback,
                getErc20AToken,
                getRelatedAToken,
                timestamp,
              ),
            ),
          ),
        )

        const filteredApys = apys.filter((apy) => apy !== undefined)

        const entries = filteredApys.map(
          ({ assetId, underlyingSupplyApy, underlyingBorrowApy, lpAPY }) => {
            const supplyApy = Big(underlyingSupplyApy)
              .plus(lpAPY ?? 0)
              .div(100)
            const borrowApy = Big(underlyingBorrowApy)
              .plus(lpAPY ?? 0)
              .div(100)
            return [
              assetId,
              {
                supplyApy: supplyApy.toString(),
                borrowApy: borrowApy.toString(),
              },
            ] as const
          },
        )

        const positions = await Promise.all(
          accountProxies.map(async (proxyAddress) => {
            const evmAddress = safeConvertAnyToH160(proxyAddress)

            const borrowSummary = await queryClient.ensureQueryData(
              userBorrowSummaryQuery(
                rpc,
                evmAddress,
                queryClient,
                timestamp ?? 0n,
                new Map(entries),
              ),
            )

            const borrowSummaryData = borrowSummary.userReservesData.find(
              (userReserve) => Big(userReserve.underlyingBalance).gt(0),
            )

            if (!borrowSummaryData) return undefined

            const publicKey = safeConvertSS58toPublicKey(proxyAddress)

            // const { events } = await queryClient.fetchQuery(
            //   pureCreatedEventsQuery(indexerClient, publicKey),
            // )

            // const event = events[0]

            // if (!event || !event.extrinsic) throw new Error("No event found")

            const proxyCreateData = {
              // blockHeight: event.block.height,
              // extrinsicIndex: event.extrinsic.indexInBlock,
              blockHeight: 64000,
              extrinsicIndex: 1,
            }

            const blocksAgo =
              Number(parachainBlockNumber) - Number(proxyCreateData.blockHeight)
            const deltaMs = blocksAgo * PARACHAIN_BLOCK_TIME
            const proxyCreatedAt = new Date(currentTimestampMs - deltaMs)

            return {
              borrowSummaryData,
              proxyCreateData,
              proxyCreatedAt,
              publicKey,
              proxyAddress,
              netApy: borrowSummary.netAPY,
              netWorth: borrowSummary.netWorthUSD,
              healthFactor: borrowSummary.healthFactor,
            }
          }),
        )

        return positions.filter((position) => position !== undefined)
      },
    }),
  )
}
