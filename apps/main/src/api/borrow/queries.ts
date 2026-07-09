import {
  DEFAULT_NULL_VALUE_ON_TX,
  ProtocolAction,
  transactionType,
} from "@aave/contract-helpers"
import { Web3Provider } from "@ethersproject/providers"
import { pureCreatedEventsQuery } from "@galacticcouncil/indexer/indexer"
import {
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from "@galacticcouncil/money-market/hooks"
import { ExternalApyData } from "@galacticcouncil/money-market/types"
import {
  AaveV3GIGAHDXPool,
  AaveV3HydrationMainnet,
  gasLimitRecommendations,
  STHDX_ASSET_ID,
} from "@galacticcouncil/money-market/ui-config"
import {
  formatGhoReserveData,
  formatGhoUserData,
  formatReserveIncentives,
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
  getGhoBorrowApyRange,
  getMaxGhoMintAmount,
  getUserApyValues,
  GhoService,
  IncentivesControllerV2,
  isGho,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@galacticcouncil/money-market/utils"
import {
  EXTERNAL_APY_ASSET_IDS,
  getAddressFromAssetId,
  QUERY_KEY_BLOCK_PREFIX,
  safeConvertAnyToH160,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import {
  queryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import Big from "big.js"
import { PopulatedTransaction } from "ethers"
import { produce } from "immer"
import { Binary, FixedSizeArray, SizedHex } from "polkadot-api"
import { useCallback, useMemo } from "react"

import {
  useBorrowIncentivesContract,
  useBorrowPoolContract,
  useBorrowPoolDataContract,
  useGhoServiceContract,
} from "@/api/borrow/contracts"
import { borrowAssetApyQuery } from "@/api/borrow/hooks"
import { bestNumberQuery, useBlockTimestamp } from "@/api/chain"
import {
  ASSET_ID_TO_DEFILLAMA_ID,
  defillamaLatestApyQuery,
} from "@/api/external/defillama"
import { ASSET_ID_TO_KAMINO_ID, kaminoApyQuery } from "@/api/external/kamino"
import {
  TProviderData,
  useIndexerClient,
  useProxyUrl,
  useSquidClient,
} from "@/api/provider"
import { getAccountProxies } from "@/api/proxy"
import { MULTIPLY_ASSETS_CONFIG } from "@/modules/borrow/multiply/config/pairs"
import { useAssets } from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

export const lendingPoolAddressProvider =
  AaveV3HydrationMainnet.POOL_ADDRESSES_PROVIDER
export const gigaLendingPoolAddressProvider =
  AaveV3GIGAHDXPool.POOL_ADDRESSES_PROVIDER

const GHO_TOKEN_FACILITATOR_ABI = [
  {
    inputs: [{ internalType: "address", name: "facilitator", type: "address" }],
    name: "getFacilitatorBucket",
    outputs: [
      { internalType: "uint256", name: "bucketCapacity", type: "uint256" },
      { internalType: "uint256", name: "bucketLevel", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

export type GigaBorrowableHollar = {
  borrowableHollarWei: string
  borrowableHollar: string
  availableBorrowsBase: string
  totalCollateralBase: string
  totalDebtBase: string
}

const RESERVES_STALE_TIME = 12_000
const USER_RESERVES_STALE_TIME = 30_000

export const borrowIncentivesQuery = (
  lendingPoolAddressProvider: string,
  incentivesContract: UiIncentiveDataProvider | null,
) =>
  queryOptions({
    queryKey: ["borrow", "incentives", lendingPoolAddressProvider],
    queryFn: async () => {
      if (!incentivesContract) throw new Error("Invalid incentivesContract")

      return incentivesContract.getReservesIncentivesDataHumanized({
        lendingPoolAddressProvider,
      })
    },
    retry: false,
    enabled: !!lendingPoolAddressProvider && !!incentivesContract,
  })

export const borrowReserveQuery = (
  rpc: TProviderContext,
  lendingPoolAddressProvider: string,
  poolDataContract: UiPoolDataProvider | null,
  incentivesContract: UiIncentiveDataProvider | null,
  reserveId: string,
) =>
  queryOptions({
    queryKey: ["borrow", "reserve", reserveId, lendingPoolAddressProvider],
    queryFn: async () => {
      if (!poolDataContract) throw new Error("Invalid poolDataContract")

      const reserves = await rpc.queryClient.ensureQueryData(
        borrowReservesQuery(
          rpc,
          lendingPoolAddressProvider,
          poolDataContract,
          incentivesContract,
        ),
      )

      if (!reserves) throw new Error("Reserves not found")

      return reserves.formattedReserves.find(
        (r) => r.underlyingAsset === reserveId,
      )
    },
    retry: false,
    enabled:
      !!lendingPoolAddressProvider &&
      !!poolDataContract &&
      !!reserveId &&
      rpc.isApiLoaded,
  })

export const borrowReservesQuery = (
  rpc: TProviderContext,
  lendingPoolAddressProvider: string,
  poolDataContract: UiPoolDataProvider | null,
  incentivesContract: UiIncentiveDataProvider | null,
) =>
  queryOptions({
    queryKey: ["borrow", "reserves", lendingPoolAddressProvider],
    queryFn: async () => {
      if (!poolDataContract) throw new Error("Invalid poolDataContract")

      const reserveIncetnivesPromise = incentivesContract
        ? rpc.queryClient.ensureQueryData(
            borrowIncentivesQuery(
              lendingPoolAddressProvider,
              incentivesContract,
            ),
          )
        : Promise.resolve([])

      const [reserves, reserveIncentives, bestNumber] = await Promise.all([
        poolDataContract.getReservesHumanized({
          lendingPoolAddressProvider,
        }),
        reserveIncetnivesPromise,
        rpc.queryClient.ensureQueryData(bestNumberQuery(rpc)),
      ])

      const timestamp = bestNumber.timestamp
      const { baseCurrencyData, reservesData } = reserves
      const currentTimestamp = Number(timestamp) / 1000
      const formattedReserveIncentives = formatReserveIncentives(
        reserveIncentives ?? [],
      )

      const formattedReserves = formatReservesAndIncentives({
        currentTimestamp,
        reserves: reservesData,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        reserveIncentives: formattedReserveIncentives,
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
    staleTime: RESERVES_STALE_TIME,
    enabled:
      !!lendingPoolAddressProvider && !!poolDataContract && rpc.isApiLoaded,
  })

export const useBorrowReserves = () => {
  const rpc = useRpcProvider()
  const poolDataContract = useBorrowPoolDataContract()
  const incentivesContract = useBorrowIncentivesContract()

  return useQuery(
    borrowReservesQuery(
      rpc,
      lendingPoolAddressProvider,
      poolDataContract,
      incentivesContract,
    ),
  )
}

export const userBorrowReservesQuery = (
  evmAddress: string,
  lendingPoolAddressProvider: string,
  poolDataContract: UiPoolDataProvider | null,
) =>
  queryOptions({
    queryKey: [
      "borrow",
      "userReserves",
      evmAddress,
      lendingPoolAddressProvider,
    ],
    queryFn: async () => {
      if (!poolDataContract) throw new Error("Invalid poolDataContract")

      return poolDataContract.getUserReservesHumanized({
        lendingPoolAddressProvider,
        user: evmAddress,
      })
    },
    retry: false,
    staleTime: USER_RESERVES_STALE_TIME,
    enabled: !!evmAddress && !!lendingPoolAddressProvider && !!poolDataContract,
  })

export const useUserBorrowReserves = (givenAddress?: string) => {
  const poolDataContract = useBorrowPoolDataContract()

  const { account } = useAccount()

  const address = givenAddress || account?.address || ""
  const evmAddress = safeConvertAnyToH160(address)

  return useQuery(
    userBorrowReservesQuery(
      evmAddress,
      lendingPoolAddressProvider,
      poolDataContract,
    ),
  )
}

export const borrowUserIncentivesQuery = (
  evmAddress: string,
  lendingPoolAddressProvider: string,
  incentivesContract: UiIncentiveDataProvider | null,
) =>
  queryOptions({
    queryKey: [
      "borrow",
      "userIncentives",
      evmAddress,
      lendingPoolAddressProvider,
    ],
    queryFn: async () => {
      if (!incentivesContract) throw new Error("Invalid incentivesContract")

      return incentivesContract.getUserReservesIncentivesDataHumanized({
        lendingPoolAddressProvider,
        user: evmAddress,
      })
    },
    retry: false,
    enabled:
      !!evmAddress && !!lendingPoolAddressProvider && !!incentivesContract,
  })

export const useBorrowUserIncentives = (givenAddress?: string) => {
  const incentivesContract = useBorrowIncentivesContract()
  const { account } = useAccount()

  const address = givenAddress || account?.address || ""

  const evmAddress = safeConvertAnyToH160(address)

  return useQuery(
    borrowUserIncentivesQuery(
      evmAddress,
      lendingPoolAddressProvider,
      incentivesContract,
    ),
  )
}

export const ghoReserveDataQuery = (ghoServiceContract: GhoService | null) =>
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
  evmAddress: string,
  rpc: TProviderContext,
  ghoServiceContract: GhoService | null,
) =>
  queryOptions({
    queryKey: ["borrow", "gho", "userData", evmAddress],
    queryFn: async () => {
      if (!ghoServiceContract) throw new Error("Invalid ghoServiceContract")

      const bestNumber = await rpc.queryClient.ensureQueryData(
        bestNumberQuery(rpc),
      )
      const timestamp = bestNumber.timestamp
      if (!timestamp || timestamp <= 0) throw new Error("Invalid timestamp")

      const [{ ghoReserveData, formattedGhoReserveData }, ghoUserData] =
        await Promise.all([
          rpc.queryClient.ensureQueryData(
            ghoReserveDataQuery(ghoServiceContract),
          ),
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
    enabled: !!evmAddress && !!ghoServiceContract && rpc.isApiLoaded,
  })

export const useGhoUserData = (evmAddress: string) => {
  const rpc = useRpcProvider()
  const ghoServiceContract = useGhoServiceContract()

  return useQuery(ghoUserDataQuery(evmAddress, rpc, ghoServiceContract))
}

export const userBorrowSummaryQueryKey = (
  evmAddress: string,
  lendingPoolAddressProvider: string,
) => ["borrow", "userSummary", evmAddress, lendingPoolAddressProvider]

export const userBorrowSummaryQuery = (
  evmAddress: string,
  rpc: TProviderContext,
  lendingPoolAddressProvider: string,
  poolDataContract: UiPoolDataProvider | null,
  ghoServiceContract: GhoService | null,
  incentivesContract: UiIncentiveDataProvider | null,
  externalApyData?: ExternalApyData,
) =>
  queryOptions({
    queryKey: [
      ...userBorrowSummaryQueryKey(evmAddress, lendingPoolAddressProvider),
      !!externalApyData,
    ],
    queryFn: async () => {
      if (!poolDataContract || !ghoServiceContract)
        throw new Error("Invalid poolDataContract or ghoServiceContract")

      const bestNumber = await rpc.queryClient.ensureQueryData(
        bestNumberQuery(rpc),
      )
      const timestamp = bestNumber.timestamp
      if (!timestamp || timestamp <= 0) throw new Error("Invalid timestamp")

      const [user, reserves, reserveIncentives, userIncentives, gho] =
        await Promise.all([
          poolDataContract.getUserReservesHumanized({
            lendingPoolAddressProvider,
            user: evmAddress,
          }),
          rpc.queryClient.ensureQueryData(
            borrowReservesQuery(
              rpc,
              lendingPoolAddressProvider,
              poolDataContract,
              incentivesContract,
            ),
          ),
          rpc.queryClient.ensureQueryData(
            borrowIncentivesQuery(
              lendingPoolAddressProvider,
              incentivesContract,
            ),
          ),
          rpc.queryClient.ensureQueryData(
            borrowUserIncentivesQuery(
              evmAddress,
              lendingPoolAddressProvider,
              incentivesContract,
            ),
          ),
          rpc.queryClient.ensureQueryData(
            ghoUserDataQuery(evmAddress, rpc, ghoServiceContract),
          ),
        ])

      const { userEmodeCategoryId, userReserves } = user
      const { baseCurrencyData } = reserves
      const { formattedGhoUserData, formattedGhoReserveData } = gho

      const formattedReserves = externalApyData
        ? produce(reserves.formattedReserves, (draft) => {
            const reserveMap = new Map(draft.map((r) => [r.underlyingAsset, r]))

            for (const [assetId, data] of externalApyData.entries()) {
              const reserve = reserveMap.get(getAddressFromAssetId(assetId))
              if (reserve) {
                reserve.supplyAPY = data.supplyApy ?? reserve.supplyAPY
                reserve.variableBorrowAPY =
                  data.borrowApy ?? reserve.variableBorrowAPY
              }
            }
          })
        : reserves.formattedReserves

      const currentTimestamp = Number(timestamp) / 1000

      const summary = formatUserSummaryAndIncentives({
        currentTimestamp,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
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
          formattedGhoUserData,
          formattedGhoReserveData,
        ),
        isInEmode: userEmodeCategoryId !== 0,
        userEmodeCategoryId,
      }

      return extendedUser
    },
    retry: false,
    staleTime: USER_RESERVES_STALE_TIME,
    enabled: !!lendingPoolAddressProvider && !!evmAddress && rpc.isApiLoaded,
  })

export const useUserBorrowSummary = (givenAddress?: string) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const poolDataContract = useBorrowPoolDataContract()
  const ghoServiceContract = useGhoServiceContract()
  const incentivesContract = useBorrowIncentivesContract()

  const address = givenAddress || account?.address || ""
  const evmAddress = safeConvertAnyToH160(address)

  return useQuery(
    userBorrowSummaryQuery(
      evmAddress,
      rpc,
      lendingPoolAddressProvider,
      poolDataContract,
      ghoServiceContract,
      incentivesContract,
    ),
  )
}

export const userGigaBorrowSummaryQueryKey = (evmAddress: string) => [
  QUERY_KEY_BLOCK_PREFIX,
  "gigaBorrow",
  "userSummary",
  evmAddress,
]

export const facilitatorBucketQuery = (
  rpc: TProviderContext,
  aTokenAddress: string,
  ghoServiceContract: GhoService | null,
) =>
  queryOptions({
    retry: false,
    queryKey: ["borrow", "gho", "facilitatorBucket", aTokenAddress],
    queryFn: async () => {
      if (!ghoServiceContract) throw new Error("Invalid ghoServiceContract")

      const [facilitatorBucketCapacity, facilitatorBucketLevel] =
        await rpc.evm.readContract({
          abi: GHO_TOKEN_FACILITATOR_ABI,
          address: AaveV3HydrationMainnet.GHO_TOKEN_ADDRESS as `0x${string}`,
          functionName: "getFacilitatorBucket",
          args: [aTokenAddress as `0x${string}`],
        })

      return {
        facilitatorBucketCapacity: facilitatorBucketCapacity,
        facilitatorBucketLevel: facilitatorBucketLevel,
      }
    },
    enabled: !!aTokenAddress && !!ghoServiceContract && rpc.isApiLoaded,
  })

export const useFacilitatorBucket = (aTokenAddress: string) => {
  const rpc = useRpcProvider()
  const ghoServiceContract = useGhoServiceContract()

  return useQuery(
    facilitatorBucketQuery(rpc, aTokenAddress, ghoServiceContract),
  )
}

export type UserGigaBorrowSummary = {
  userSummary: ExtendedFormattedUser
  borrowableHollar: string
  maxBorrowableHollar: string
  hdxReserve: ComputedUserReserveData
  hollarReserve: ComputedUserReserveData
}

export const useUserGigaBorrowSummary = (givenAddress?: string) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const poolDataContract = useBorrowPoolDataContract()
  const ghoServiceContract = useGhoServiceContract()

  const address = givenAddress || account?.address || ""
  const evmAddress = safeConvertAnyToH160(address)

  const isError = !!rpc.queryClient.getQueryState(
    userGigaBorrowSummaryQueryKey(address),
  )?.error

  return useQuery({
    retry: false,
    enabled: !!address && !isError,
    queryKey: userGigaBorrowSummaryQueryKey(address),
    queryFn: async (): Promise<UserGigaBorrowSummary> => {
      if (!poolDataContract || !ghoServiceContract)
        throw new Error("Invalid poolDataContract or ghoServiceContract")

      const bestNumber = await rpc.queryClient.ensureQueryData(
        bestNumberQuery(rpc),
      )
      const timestamp = bestNumber.timestamp
      if (!timestamp || timestamp <= 0) throw new Error("Invalid timestamp")

      const [user, reserves, gho] = await Promise.all([
        poolDataContract.getUserReservesHumanized({
          lendingPoolAddressProvider: gigaLendingPoolAddressProvider,
          user: evmAddress,
        }),
        rpc.queryClient.fetchQuery(
          borrowReservesQuery(
            rpc,
            gigaLendingPoolAddressProvider,
            poolDataContract,
            null,
          ),
        ),
        rpc.queryClient.ensureQueryData(
          ghoUserDataQuery(evmAddress, rpc, ghoServiceContract),
        ),
      ])

      const { userEmodeCategoryId, userReserves } = user
      const { baseCurrencyData, formattedReserves } = reserves
      const { formattedGhoUserData, formattedGhoReserveData } = gho

      const currentTimestamp = Number(timestamp) / 1000

      const summary = formatUserSummaryAndIncentives({
        currentTimestamp,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves,
        formattedReserves,
        userEmodeCategoryId,
        reserveIncentives: [],
        userIncentives: [],
      })

      const extendedUser: ExtendedFormattedUser = {
        ...summary,
        ...getUserApyValues(
          summary,
          formattedGhoUserData,
          formattedGhoReserveData,
        ),
        isInEmode: userEmodeCategoryId !== 0,
        userEmodeCategoryId,
      }

      const hdxReserve = extendedUser.userReservesData.find(
        (reserve) =>
          reserve.underlyingAsset === getAddressFromAssetId(STHDX_ASSET_ID),
      )
      const hollarReserve = extendedUser.userReservesData.find((reserve) =>
        isGho(reserve.reserve),
      )

      if (!hdxReserve || !hollarReserve) throw new Error("Reserves not found")

      const maxUserAmountToBorrow = getMaxGhoMintAmount(
        extendedUser,
        hollarReserve.reserve,
      )

      const facilitatorBucketData = await rpc.queryClient.fetchQuery(
        facilitatorBucketQuery(
          rpc,
          hollarReserve.reserve.aTokenAddress,
          ghoServiceContract,
        ),
      )

      const bucketCapacity = facilitatorBucketData.facilitatorBucketCapacity
      const bucketLevel = facilitatorBucketData?.facilitatorBucketLevel

      const availableFromBucketWei =
        bucketCapacity > bucketLevel ? bucketCapacity - bucketLevel : 0n

      const maxBorrowableHollar = Big.min(
        maxUserAmountToBorrow,
        scaleHuman(availableFromBucketWei, hollarReserve.reserve.decimals),
      ).toString()

      return {
        userSummary: extendedUser,
        borrowableHollar: maxUserAmountToBorrow,
        maxBorrowableHollar,
        hdxReserve,
        hollarReserve,
      }
    },
  })
}

export const getClaimAllBorrowRewardsTx = async (
  rpc: TProviderContext,
  user: ExtendedFormattedUser,
  address: string,
) => {
  const evmAddress = safeConvertAnyToH160(address)
  const incentivesTxBuilderV2 = new IncentivesControllerV2(
    new Web3Provider(rpc.evm.transport),
  )

  const userIncentive = Object.values(user.calculatedUserIncentives)[0]
  const incentivesControllerAddress = userIncentive?.incentiveControllerAddress

  if (!evmAddress) throw new Error("Invalid EVM account address")
  if (!user?.userReservesData) throw new Error("User reserves not found")
  if (!incentivesControllerAddress)
    throw new Error("Incentive controller address not found")

  const assets = user.userReservesData.reduce<string[]>((acc, { reserve }) => {
    return acc.concat(
      reserve.aIncentivesData?.length ? [reserve.aTokenAddress] : [],
      reserve.vIncentivesData?.length ? [reserve.variableDebtTokenAddress] : [],
      reserve.sIncentivesData?.length ? [reserve.stableDebtTokenAddress] : [],
    )
  }, [])

  const incentivesContract = incentivesTxBuilderV2.getContractInstance(
    incentivesControllerAddress,
  )

  const txRaw = await incentivesContract.populateTransaction.claimAllRewards(
    assets,
    evmAddress,
  )

  const tx: transactionType = {
    ...txRaw,
    from: evmAddress,
    value: DEFAULT_NULL_VALUE_ON_TX,
  }

  if (!tx || !tx.from || !tx.to || !tx.data) {
    throw new Error("Invalid claim transaction")
  }

  const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } =
    await estimateGasLimit({
      evm: rpc.evm,
      gasLimit:
        gasLimitRecommendations[ProtocolAction.claimRewards]?.recommended,
      action: ProtocolAction.claimRewards,
    })

  const evmCall = rpc.papi.tx.EVM.call({
    source: tx.from as SizedHex<20>,
    target: tx.to as SizedHex<20>,
    input: Binary.fromHex(tx.data),
    value: [0n, 0n, 0n, 0n],
    gas_limit: gasLimit,
    max_fee_per_gas: maxFeePerGas,
    max_priority_fee_per_gas: maxPriorityFeePerGas,
    access_list: [],
    authorization_list: [],
    nonce: undefined,
  })

  return rpc.papi.tx.Dispatcher.dispatch_evm_call({
    call: evmCall.decodedCall,
  })
}

export const useGetClaimAllBorrowRewardsTx = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { data: user } = useUserBorrowSummary()

  return useCallback(async () => {
    const address = account?.address || ""

    if (!user) throw new Error("User not found")

    return getClaimAllBorrowRewardsTx(rpc, user, address)
  }, [account?.address, rpc, user])
}

export const convertEvmTxRawToPapiTx = async (
  provider: TProviderData,
  txRaw: PopulatedTransaction,
  evmAddress: string,
  protocolAction?: ProtocolAction,
) => {
  const tx: transactionType = {
    ...txRaw,
    from: evmAddress,
    value: DEFAULT_NULL_VALUE_ON_TX,
  }

  if (!tx || !tx.from || !tx.to || !tx.data) {
    throw new Error("Invalid transaction")
  }

  const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } =
    await estimateGasLimit({
      evm: provider.evm,
      gasLimit: tx.gasLimit?.toString(),
      action: protocolAction,
    })

  const evmCall = provider.papi.tx.EVM.call({
    source: tx.from as SizedHex<20>,
    target: tx.to as SizedHex<20>,
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

    const poolInstance = poolContract.getContractInstance(
      poolContract.poolAddress,
    )

    return await Promise.all(
      activeCollaterals.map(async (collateral) => {
        const txRaw: PopulatedTransaction =
          await poolInstance.populateTransaction.setUserUseReserveAsCollateral(
            collateral.underlyingAsset,
            false,
          )

        const tx: transactionType = {
          ...txRaw,
          from: evmAddress,
          value: DEFAULT_NULL_VALUE_ON_TX,
        }

        if (!tx || !tx.from || !tx.to || !tx.data) {
          throw new Error(
            `Disable collateral transaction not found for ${collateral.underlyingAsset}`,
          )
        }

        const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } =
          await estimateGasLimit({
            evm,
            gasLimit: tx.gasLimit?.toString(),
            action: ProtocolAction.setUsageAsCollateral,
          })

        const evmCall = papi.tx.EVM.call({
          source: tx.from as SizedHex<20>,
          target: tx.to as SizedHex<20>,
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
    async (
      reserve: string,
      usageAsCollateral: boolean,
      address?: string,
      gasLimitOverride?: bigint,
    ) => {
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
          action: ProtocolAction.setUsageAsCollateral,
        })

      const evmCall = papi.tx.EVM.call({
        source: tx.from as SizedHex<20>,
        target: tx.to as SizedHex<20>,
        input: Binary.fromHex(tx.data),
        value: [0n, 0n, 0n, 0n],
        gas_limit: gasLimitOverride || gasLimit,
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
        source: tx.from as SizedHex<20>,
        target: tx.to as SizedHex<20>,
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
  const url = useProxyUrl()

  const queryConfigs = assetIds
    .map((assetId) => {
      const defillamaId = ASSET_ID_TO_DEFILLAMA_ID[assetId]
      if (defillamaId) {
        return {
          assetId,
          type: ExternalApyType.stake,
          query: {
            ...defillamaLatestApyQuery(defillamaId, url),
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
            ...kaminoApyQuery(kaminoId, url),
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

export const getStrategyPositionsQueryKey = (address: string) => [
  "strategyPositions",
  address,
]

export const useStrategyPositions = () => {
  const { account } = useAccount()
  const queryClient = useQueryClient()
  const indexerClient = useIndexerClient()
  const squidClient = useSquidClient()
  const indexerUrl = useProxyUrl()
  const { getAssetWithFallback, getErc20AToken, getRelatedAToken } = useAssets()
  const rpc = useRpcProvider()
  const poolDataContract = useBorrowPoolDataContract()
  const ghoServiceContract = useGhoServiceContract()
  const incentivesContract = useBorrowIncentivesContract()

  const { data: timestamp } = useBlockTimestamp()

  const accountAddress = account?.address || ""

  const externalApyAssetIds = useMemo(() => {
    const configAssets = new Set<string>()

    for (const config of MULTIPLY_ASSETS_CONFIG) {
      configAssets.add(config.collateralAssetId)
      configAssets.add(config.debtAssetId)
    }

    return EXTERNAL_APY_ASSET_IDS.filter((assetId) => configAssets.has(assetId))
  }, [])

  return useQuery(
    queryOptions({
      queryKey: getStrategyPositionsQueryKey(accountAddress),
      enabled:
        !!accountAddress &&
        !!timestamp &&
        !!poolDataContract &&
        !!ghoServiceContract &&
        !!incentivesContract,
      queryFn: async () => {
        const accountProxies = await queryClient.ensureQueryData(
          getAccountProxies(rpc, accountAddress),
        )

        const bestNumber = await queryClient.ensureQueryData(
          bestNumberQuery(rpc),
        )

        if (!bestNumber) throw new Error("Best number not found")

        const parachainBlockNumber = bestNumber.parachainBlockNumber
        const currentTimestampMs = bestNumber.timestamp

        const apys = await Promise.all(
          externalApyAssetIds.map((assetId) =>
            queryClient.ensureQueryData(
              borrowAssetApyQuery(
                rpc,
                poolDataContract,
                incentivesContract,
                queryClient,
                squidClient,
                indexerUrl,
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

            const userBorrowSummary = await queryClient.fetchQuery(
              userBorrowSummaryQuery(
                evmAddress,
                rpc,
                lendingPoolAddressProvider,
                poolDataContract,
                ghoServiceContract,
                incentivesContract,
                new Map(entries),
              ),
            )

            const suppliedSummaryData = userBorrowSummary.userReservesData.find(
              (userReserve) => Big(userReserve.underlyingBalance).gt(0),
            )

            const debtSummaryData = userBorrowSummary.userReservesData.find(
              (userReserve) => Big(userReserve.totalBorrows).gt(0),
            )

            if (!suppliedSummaryData) return undefined

            const publicKey = safeConvertSS58toPublicKey(proxyAddress)

            const { events } = await queryClient.fetchQuery(
              pureCreatedEventsQuery(indexerClient, publicKey),
            )

            const event = events[0]

            const proxyCreateData = {
              blockHeight: event?.block.height ?? 64000,
              extrinsicIndex: event?.extrinsic?.indexInBlock ?? 1,
            }

            const blocksAgo =
              Number(parachainBlockNumber) - Number(proxyCreateData.blockHeight)
            const deltaMs = blocksAgo * PARACHAIN_BLOCK_TIME
            const proxyCreatedAt = new Date(currentTimestampMs - deltaMs)

            return {
              suppliedSummaryData,
              debtSummaryData,
              proxyCreateData,
              proxyCreatedAt,
              publicKey,
              proxyAddress,
              userBorrowSummary,
            }
          }),
        )

        return positions.filter((position) => position !== undefined)
      },
    }),
  )
}
