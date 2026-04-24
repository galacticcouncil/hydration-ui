import {
  DEFAULT_NULL_VALUE_ON_TX,
  ProtocolAction,
  transactionType,
} from "@aave/contract-helpers"
import { Web3Provider } from "@ethersproject/providers"
import { ExtendedFormattedUser } from "@galacticcouncil/money-market/hooks"
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
  getUserApyValues,
  GhoService,
  IncentivesControllerV2,
  isGho,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@galacticcouncil/money-market/utils"
import {
  getAddressFromAssetId,
  safeConvertAnyToH160,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { queryOptions, useQueries, useQuery } from "@tanstack/react-query"
import { PopulatedTransaction } from "ethers"
import { Binary, FixedSizeArray } from "polkadot-api"
import { useCallback } from "react"

import {
  useBorrowIncentivesContract,
  useBorrowPoolContract,
  useBorrowPoolDataContract,
  useGhoServiceContract,
} from "@/api/borrow/contracts"
import { bestNumberQuery } from "@/api/chain"
import {
  ASSET_ID_TO_DEFILLAMA_ID,
  defillamaLatestApyQuery,
} from "@/api/external/defillama"
import { ASSET_ID_TO_KAMINO_ID, kaminoApyQuery } from "@/api/external/kamino"
import { TProviderData } from "@/api/provider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

export const lendingPoolAddressProvider =
  AaveV3HydrationMainnet.POOL_ADDRESSES_PROVIDER
export const gigaLendingPoolAddressProvider =
  AaveV3GIGAHDXPool.POOL_ADDRESSES_PROVIDER

const GIGA_MM2_POOL_ABI = [
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserAccountData",
    outputs: [
      { internalType: "uint256", name: "totalCollateralBase", type: "uint256" },
      { internalType: "uint256", name: "totalDebtBase", type: "uint256" },
      {
        internalType: "uint256",
        name: "availableBorrowsBase",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "currentLiquidationThreshold",
        type: "uint256",
      },
      { internalType: "uint256", name: "ltv", type: "uint256" },
      { internalType: "uint256", name: "healthFactor", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

const AAVE_BASE_CURRENCY_DECIMALS = 8n
const HOLLAR_DECIMALS = 18n

export type GigaBorrowableHollar = {
  borrowableHollarWei: string
  borrowableHollar: string
  availableBorrowsBase: string
  totalCollateralBase: string
  totalDebtBase: string
}

export const gigaBorrowableHollarQuery = (
  evmAddress: string,
  rpc: TProviderContext,
) =>
  queryOptions({
    queryKey: ["borrow", "giga", "borrowableHollar", evmAddress],
    queryFn: async (): Promise<GigaBorrowableHollar> => {
      const accountData = await rpc.evm.readContract({
        abi: GIGA_MM2_POOL_ABI,
        address: AaveV3GIGAHDXPool.POOL as `0x${string}`,
        functionName: "getUserAccountData",
        args: [evmAddress as `0x${string}`],
      })

      const [totalCollateralBase, totalDebtBase, availableBorrowsBase] =
        accountData

      const borrowableHollarWei =
        availableBorrowsBase *
        10n ** (HOLLAR_DECIMALS - AAVE_BASE_CURRENCY_DECIMALS)

      const whole = borrowableHollarWei / 10n ** HOLLAR_DECIMALS
      const fraction = (borrowableHollarWei % 10n ** HOLLAR_DECIMALS)
        .toString()
        .padStart(Number(HOLLAR_DECIMALS), "0")
        .replace(/0+$/, "")

      return {
        borrowableHollarWei: borrowableHollarWei.toString(),
        borrowableHollar: fraction
          ? `${whole.toString()}.${fraction}`
          : whole.toString(),
        availableBorrowsBase: availableBorrowsBase.toString(),
        totalCollateralBase: totalCollateralBase.toString(),
        totalDebtBase: totalDebtBase.toString(),
      }
    },
    retry: false,
    enabled: !!evmAddress && rpc.isApiLoaded,
  })

export const borrowIncentivesQuery = (
  lendingPoolAddressProvider: string,
  incentivesContract: UiIncentiveDataProvider | null,
) =>
  queryOptions({
    queryKey: ["borrow", "incentives", lendingPoolAddressProvider],
    queryFn: async () => {
      if (!incentivesContract) throw new Error("Invalid incentivesContract")

      const incentives =
        await incentivesContract.getReservesIncentivesDataHumanized({
          lendingPoolAddressProvider,
        })

      return formatReserveIncentives(incentives)
    },
    retry: false,
    enabled: !!lendingPoolAddressProvider && !!incentivesContract,
  })

export const useBorrowIncentives = () => {
  const incentivesContract = useBorrowIncentivesContract()

  return useQuery(
    borrowIncentivesQuery(lendingPoolAddressProvider, incentivesContract),
  )
}

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
) =>
  queryOptions({
    queryKey: userBorrowSummaryQueryKey(evmAddress, lendingPoolAddressProvider),
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

export const useUserGigaBorrowSummary = (givenAddress?: string) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const poolDataContract = useBorrowPoolDataContract()
  const ghoServiceContract = useGhoServiceContract()

  const address = givenAddress || account?.address || ""
  const evmAddress = safeConvertAnyToH160(address)

  return useQuery({
    queryKey: ["gigaBorrow", "userSummary", evmAddress],
    queryFn: async () => {
      if (!poolDataContract || !ghoServiceContract)
        throw new Error("Invalid poolDataContract or ghoServiceContract")

      const bestNumber = await rpc.queryClient.ensureQueryData(
        bestNumberQuery(rpc),
      )
      const timestamp = bestNumber.timestamp
      if (!timestamp || timestamp <= 0) throw new Error("Invalid timestamp")

      const [user, reserves, gho, borrowableHollar] = await Promise.all([
        poolDataContract.getUserReservesHumanized({
          lendingPoolAddressProvider: gigaLendingPoolAddressProvider,
          user: evmAddress,
        }),
        rpc.queryClient.ensureQueryData(
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

        rpc.queryClient.ensureQueryData(
          gigaBorrowableHollarQuery(evmAddress, rpc),
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
          formattedReserves,
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

      return {
        userSummary: extendedUser,
        borrowableHollar,
        hdxReserve,
        hollarReserve,
      }
    },
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
        evm,
        gasLimit:
          gasLimitRecommendations[ProtocolAction.claimRewards]?.recommended,
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
    async (reserve: string, usageAsCollateral: boolean) => {
      const address = account?.address || ""
      const evmAddress = safeConvertAnyToH160(address)

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
