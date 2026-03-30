import { InterestRate } from "@aave/contract-helpers"
import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { getReserveAssetIdByAddress } from "@galacticcouncil/money-market/utils"
import { AssetLabel, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { Amount } from "@galacticcouncil/ui/components/Amount"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  bigShift,
  getAssetIdFromAddress,
  MAX_UINT256,
  safeConvertAnyToH160,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { Enum } from "polkadot-api"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useBorrowPoolBundleContract } from "@/api/borrow/contracts"
import {
  getStrategyPositionsQueryKey,
  useStrategyPositions,
} from "@/api/borrow/queries"
import { blockWeightsQuery } from "@/api/chain"
import { createProxyCall, getAccountProxiesQueryKey } from "@/api/proxy"
import { AssetLogo } from "@/components/AssetLogo"
import { useCreateMultiplyEvmTx } from "@/modules/borrow/hooks/useCreateMultiplyEvmTx"
import { MULTIPLY_ASSETS_CONFIG } from "@/modules/borrow/multiply/config"
import { UnloopStep } from "@/modules/borrow/multiply/hooks/useUnloopingProxySteps"
import { getEnterWithAssetId } from "@/modules/borrow/multiply/MultiplyApp.utils"
import { validateEvmTx } from "@/modules/borrow/multiply/utils/batch"
import { RESERVE_LOGO_OVERRIDE_MAP } from "@/modules/borrow/reserve/components/ReserveLabel"
import {
  calculateChunkSize,
  getChunkByIndex,
} from "@/modules/transactions/hooks/useBatchTx"
import { AnyPapiTx } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import {
  MultiTransactionConfig,
  useTransactionsStore,
} from "@/states/transactions"

export const isLoopedPosition = (
  position: StrategyPositionsData,
): position is StrategyPositionsData & {
  debtReserve: ComputedReserveData
  debtBalance: string
} => {
  return !!position.debtReserve && !!position.debtBalance
}

export type StrategyPositionsData = {
  proxyAddress: string
  publicKey: string
  suppliedReserve: ComputedReserveData
  suppliedBalance: string
  suppliedDisplayBalance: string
  suppliedAssetId: string
  suppliedSymbol: string
  createdAt: Date
  netApy: number
  netWorth: string
  healthFactor: string
  debtReserve: ComputedReserveData | undefined
  debtBalance: string | undefined
  proxyCreateData: {
    blockHeight: number
    extrinsicIndex: number
  }
}

export type StrategyPositionsGroupedData = {
  suppliedAssetId: string
  positions: Array<StrategyPositionsData>
  netWorth: string
  totalBalance: string
  totalDisplayBalance: string
  positionsAmount: number
  avgApy: string
  avgHealthFactor: string
  symbol: string
}

export const useStrategyGroupedPositions = () => {
  const { data: strategyPositions, isLoading } = useStrategyPositions()

  const data = useMemo(() => {
    if (!strategyPositions) return []

    const positions: Array<StrategyPositionsData> = strategyPositions.map(
      (position) => ({
        proxyAddress: position.proxyAddress,
        publicKey: position.publicKey,
        suppliedReserve: position.suppliedSummaryData.reserve,
        suppliedAssetAddress:
          position.suppliedSummaryData.reserve.underlyingAsset,
        suppliedAssetId: getAssetIdFromAddress(
          position.suppliedSummaryData.reserve.underlyingAsset,
        ),
        suppliedBalance: position.suppliedSummaryData.underlyingBalance,
        suppliedDisplayBalance:
          position.suppliedSummaryData.underlyingBalanceUSD,
        suppliedSymbol: position.suppliedSummaryData.reserve.symbol,
        createdAt: position.proxyCreatedAt,
        netApy: position.netApy,
        netWorth: position.netWorth,
        healthFactor: position.healthFactor,
        debtReserve: position.debtSummaryData?.reserve,
        debtBalance: position.debtSummaryData?.totalBorrows,
        proxyCreateData: position.proxyCreateData,
      }),
    )

    return Object.entries(
      Object.groupBy(positions, (position) => position.suppliedAssetId),
    ).map(([suppliedAssetId, positions = []]) => {
      const {
        totalBalance,
        totalDisplayBalance,
        totalNetWorth,
        totalWeightedApy,
        totalHealthFactor,
      } = positions.reduce(
        (acc, p) => ({
          totalBalance: acc.totalBalance.plus(p.suppliedBalance),
          totalDisplayBalance: acc.totalDisplayBalance.plus(
            p.suppliedDisplayBalance,
          ),
          totalNetWorth: acc.totalNetWorth.plus(p.netWorth),
          totalWeightedApy: acc.totalWeightedApy.plus(
            Big(p.netApy).times(p.netWorth),
          ),
          totalHealthFactor: acc.totalHealthFactor.plus(p.healthFactor),
        }),
        {
          totalBalance: Big(0),
          totalDisplayBalance: Big(0),
          totalNetWorth: Big(0),
          totalWeightedApy: Big(0),
          totalHealthFactor: Big(0),
        },
      )

      return {
        suppliedAssetId,
        positions,
        symbol: positions[0]?.suppliedSymbol ?? "",
        totalBalance: totalBalance.toString(),
        totalDisplayBalance: totalDisplayBalance.toString(),
        netWorth: totalNetWorth.toString(),
        positionsAmount: positions.length,
        avgApy: totalNetWorth.eq(0)
          ? "0"
          : totalWeightedApy.div(totalNetWorth).toString(),
        avgHealthFactor: totalHealthFactor.div(positions.length).toString(),
      }
    })
  }, [strategyPositions])

  return {
    data,
    isLoading,
  }
}

export const getStrategyByPosition = (position: StrategyPositionsData) => {
  const debtAssetId = position.debtReserve
    ? getReserveAssetIdByAddress(position.debtReserve.underlyingAsset)
    : undefined

  return MULTIPLY_ASSETS_CONFIG.find(
    (config) =>
      config.collateralAssetId === position.suppliedAssetId &&
      (debtAssetId ? config.debtAssetId === debtAssetId : true),
  )
}

const isFullClose = true // support only full withdraw for now

export const useCloseLoopedPosition = (
  steps: UnloopStep[],
  enterWithAssetId: string,
) => {
  const rpc = useRpcProvider()
  const { createTransaction } = useTransactionsStore()
  const { account } = useAccount()
  const { getRelatedAToken } = useAssets()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const poolBundleContract = useBorrowPoolBundleContract()
  const createEvmTx = useCreateMultiplyEvmTx()
  const queryClient = useQueryClient()

  const { sdk } = rpc

  const getUnloopTxs = async (
    steps: UnloopStep[],
    debtReserve: ComputedReserveData,
    proxyAddress: string,
  ) => {
    if (!poolBundleContract) throw new Error("Pool bundle contract not found")

    const evmProxyAddress = safeConvertAnyToH160(proxyAddress)

    return (
      await Promise.all(
        steps.map(async (step, index) => {
          const builtTx = await sdk.tx
            .trade(step.trade)
            .withSlippage(slippage)
            .withBeneficiary(proxyAddress)
            .build()

          const isLastStep = index === steps.length - 1
          const repayThisStep = new Big(step.repay)
          const repayTx = poolBundleContract.repayTxBuilder.generateTxData({
            amount:
              isFullClose && isLastStep
                ? MAX_UINT256.toString()
                : bigShift(repayThisStep, debtReserve.decimals).toFixed(0),
            reserve: debtReserve.underlyingAsset,
            interestRateMode: InterestRate.Variable,
            user: evmProxyAddress,
            useOptimizedPath: false,
          })
          validateEvmTx(repayTx)

          return [builtTx.get(), createEvmTx(repayTx)]
        }),
      )
    ).flat()
  }

  return useMutation({
    mutationFn: async (
      position: StrategyPositionsData & {
        debtReserve: ComputedReserveData
        debtBalance: string
      },
    ) => {
      if (!account) throw new Error("No account found")

      const blockWeights = await queryClient.fetchQuery(blockWeightsQuery(rpc))
      const blockWeightsData = blockWeights?.per_class.normal.max_extrinsic

      if (!blockWeightsData)
        throw new Error("Missing required parameters for batch transaction")

      const collateralAsset = getRelatedAToken(position.suppliedAssetId)

      if (!collateralAsset) throw new Error("No collateralAsset found")

      const { proxyAddress, debtReserve } = position
      const debtAssetId = getReserveAssetIdByAddress(
        debtReserve.underlyingAsset,
      )

      const unloopTxs = await getUnloopTxs(steps, debtReserve, proxyAddress)

      const { chunkSize, batchCount } = await calculateChunkSize(
        rpc.papi,
        account.address,
        unloopTxs,
        blockWeightsData,
      )

      const chunkIndices =
        batchCount === 1 ? [null] : [...Array(batchCount).keys()]

      const tx: MultiTransactionConfig[] = []

      for (const i of chunkIndices) {
        tx.push({
          stepTitle: "Unlooping",
          tx: async () => {
            const calls =
              i === null ? unloopTxs : getChunkByIndex(unloopTxs, i, chunkSize)

            const toasts = {
              submitted: "Unlooping",
              success: "Unlooped",
            }

            return {
              title: "Unlooping",
              toasts,
              tx: createProxyCall(
                rpc.papi,
                position.proxyAddress,
                rpc.papi.tx.Utility.batch_all({
                  calls: calls.map((tx) => tx.decodedCall),
                }).decodedCall,
                true,
              ),
            }
          },
        })
      }

      tx.push({
        stepTitle: "Swap funds",
        tx: async (res) => {
          console.log(res)
          const toasts = {
            submitted: "Sending funds",
            success: "Funds sent",
          }

          const [collateralBalance, debtBalance] = await Promise.all([
            sdk.client.balance.getBalance(
              proxyAddress,
              Number(collateralAsset.id),
            ),
            sdk.client.balance.getBalance(proxyAddress, Number(debtAssetId)),
          ])

          const collateralTrade = await rpc.sdk.api.router.getBestSell(
            Number(collateralAsset.id),
            Number(enterWithAssetId),
            bigShift(
              collateralBalance.transferable.toString(),
              -collateralAsset.decimals,
            ).toString(),
          )

          const collateralTradeTx = await sdk.tx
            .trade(collateralTrade)
            .withSlippage(slippage)
            .withBeneficiary(proxyAddress)
            .build()

          let debtTradeTx: AnyPapiTx | undefined

          if (
            debtBalance.transferable > 0n &&
            enterWithAssetId !== debtAssetId
          ) {
            const debtTrade = await rpc.sdk.api.router.getBestSell(
              Number(debtAssetId),
              Number(enterWithAssetId),
              bigShift(
                debtBalance.transferable.toString(),
                -debtReserve.decimals,
              ).toString(),
            )

            const isErrors = debtTrade.swaps.some(
              (swap) => swap.errors.length > 0,
            )

            if (!isErrors) {
              debtTradeTx = await (
                await sdk.tx
                  .trade(debtTrade)
                  .withSlippage(slippage)
                  .withBeneficiary(proxyAddress)
                  .build()
              ).get()
            }
          }

          return {
            title: "Swap funds",
            tx: createProxyCall(
              rpc.papi,
              position.proxyAddress,
              debtTradeTx
                ? rpc.papi.tx.Utility.batch_all({
                    calls: [
                      debtTradeTx.decodedCall,
                      collateralTradeTx.get().decodedCall,
                    ],
                  }).decodedCall
                : collateralTradeTx.get().decodedCall,
            ),
            toasts,
          }
        },
      })

      tx.push({
        stepTitle: "Kill proxy",
        tx: async () => {
          const balance = await sdk.client.balance.getBalance(
            proxyAddress,
            Number(enterWithAssetId),
          )
          const transferableBalance = balance.transferable

          console.log(
            "Tranfering back initial asset",
            transferableBalance.toString(),
          )

          const transfetBalanceTx = rpc.papi.tx.Currencies.transfer({
            currency_id: Number(enterWithAssetId),
            dest: account.address,
            amount: transferableBalance,
          })

          const killProxyTx = rpc.papi.tx.Proxy.kill_pure({
            spawner: account.address,
            index: 0,
            height: position.proxyCreateData.blockHeight,
            ext_index: position.proxyCreateData.extrinsicIndex,
            proxy_type: Enum("Any"),
          })

          const toasts = {
            submitted: "Killing proxy",
            success: "Proxy killed",
          }

          return {
            title: "Kill proxy",
            toasts,
            tx: createProxyCall(
              rpc.papi,
              position.proxyAddress,
              rpc.papi.tx.Utility.batch_all({
                calls: [transfetBalanceTx.decodedCall, killProxyTx.decodedCall],
              }).decodedCall,
              true,
            ),
          }
        },
      })

      await createTransaction(
        {
          tx,
        },
        {
          onSuccess: () => {
            queryClient.setQueriesData<Array<{ proxyAddress: string }>>(
              {
                queryKey: getStrategyPositionsQueryKey(account.address),
              },
              (previousPositions) =>
                previousPositions?.filter(
                  (cachedPosition) =>
                    cachedPosition.proxyAddress !== position.proxyAddress,
                ) ?? [],
            )
            queryClient.setQueriesData<Array<string>>(
              {
                queryKey: getAccountProxiesQueryKey(account.address),
              },
              (prevResult) =>
                prevResult?.filter(
                  (proxyAddress) => proxyAddress !== position.proxyAddress,
                ) ?? [],
            )
          },
        },
      )
    },
  })
}

export const useClosePositions = () => {
  const rpc = useRpcProvider()
  const { createTransaction } = useTransactionsStore()
  const { account } = useAccount()
  const { getRelatedAToken } = useAssets()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const queryClient = useQueryClient()

  const { sdk } = rpc

  return useMutation({
    mutationFn: async (position: StrategyPositionsData) => {
      if (!account) throw new Error("No account found")
      const collateralAsset = getRelatedAToken(position.suppliedAssetId)

      if (!collateralAsset) throw new Error("No collateralAsset found")

      const { proxyAddress } = position

      const strategy = getStrategyByPosition(position)

      if (!strategy) throw new Error("Strategy not found")

      const enterWithAssetId = getEnterWithAssetId(
        strategy,
        position.suppliedAssetId,
      )

      const tx: MultiTransactionConfig[] = [
        {
          stepTitle: "Swap funds",
          tx: async () => {
            const toasts = {
              submitted: "Swapping funds",
              success: "Funds swapped",
            }

            const collateralBalance = await sdk.client.balance.getBalance(
              proxyAddress,
              Number(collateralAsset.id),
            )

            const collateralTrade = await rpc.sdk.api.router.getBestSell(
              Number(collateralAsset.id),
              Number(enterWithAssetId),
              bigShift(
                collateralBalance.transferable.toString(),
                -collateralAsset.decimals,
              ).toString(),
            )

            const collateralTradeTx = await sdk.tx
              .trade(collateralTrade)
              .withSlippage(slippage)
              .withBeneficiary(proxyAddress)
              .build()

            return {
              title: "Swap funds",
              tx: createProxyCall(
                rpc.papi,
                position.proxyAddress,
                collateralTradeTx.get().decodedCall,
              ),
              toasts,
            }
          },
        },
        {
          stepTitle: "Kill proxy",
          tx: async (res) => {
            console.log(res)

            const balance = await sdk.client.balance.getBalance(
              proxyAddress,
              Number(enterWithAssetId),
            )
            const transferableBalance = balance.transferable

            console.log(
              "Tranfering back initial asset",
              transferableBalance.toString(),
            )

            const transfetBalanceTx = rpc.papi.tx.Currencies.transfer({
              currency_id: Number(enterWithAssetId),
              dest: account.address,
              amount: transferableBalance,
            })
            const killProxyTx = rpc.papi.tx.Proxy.kill_pure({
              spawner: account.address,
              index: 0,
              height: position.proxyCreateData.blockHeight,
              ext_index: position.proxyCreateData.extrinsicIndex,
              proxy_type: Enum("Any"),
            })

            const toasts = {
              submitted: "Killing proxy",
              success: "Proxy killed",
            }

            return {
              title: "Kill proxy",
              toasts,
              tx: createProxyCall(
                rpc.papi,
                position.proxyAddress,
                rpc.papi.tx.Utility.batch_all({
                  calls: [
                    transfetBalanceTx.decodedCall,
                    killProxyTx.decodedCall,
                  ],
                }).decodedCall,
                true,
              ),
            }
          },
        },
      ]

      await createTransaction(
        {
          tx,
        },
        {
          onSuccess: () => {
            queryClient.setQueriesData<Array<{ proxyAddress: string }>>(
              {
                queryKey: getStrategyPositionsQueryKey(account.address),
              },
              (previousPositions) =>
                previousPositions?.filter(
                  (cachedPosition) =>
                    cachedPosition.proxyAddress !== position.proxyAddress,
                ) ?? [],
            )
            queryClient.setQueriesData<Array<string>>(
              {
                queryKey: getAccountProxiesQueryKey(account.address),
              },
              (prevResult) =>
                prevResult?.filter(
                  (proxyAddress) => proxyAddress !== position.proxyAddress,
                ) ?? [],
            )
          },
        },
      )
    },
  })
}

const assetsColumnHelper = createColumnHelper<StrategyPositionsGroupedData>()

export const useStrategyAssetsColumns = () => {
  const { isMobile } = useBreakpoints()
  const { t } = useTranslation("common")
  const { getRelatedAToken } = useAssets()

  return useMemo(
    () => [
      assetsColumnHelper.accessor("suppliedAssetId", {
        header: "Position",
        cell: ({
          row: {
            original: { suppliedAssetId, symbol },
          },
        }) => {
          const overrideIconId = RESERVE_LOGO_OVERRIDE_MAP[suppliedAssetId]

          const logoId = overrideIconId ?? suppliedAssetId
          const symbol_ = overrideIconId
            ? (getRelatedAToken(suppliedAssetId)?.symbol ?? symbol)
            : symbol

          return (
            <Flex align="center" gap="s">
              <AssetLogo id={logoId} />
              <AssetLabel symbol={symbol_} />
            </Flex>
          )
        },
      }),
      assetsColumnHelper.accessor("netWorth", {
        header: "Total Net Worth",
        meta: {
          sx: { textAlign: isMobile ? "right" : "left" },
        },
        cell: ({ row }) => {
          return (
            <Amount value={t("currency", { value: row.original.netWorth })} />
          )
        },
      }),
      assetsColumnHelper.accessor("avgApy", {
        header: "Average APY",
        cell: ({ row }) => {
          return (
            <Amount
              value={t("percent", { value: Number(row.original.avgApy) * 100 })}
            />
          )
        },
      }),
      assetsColumnHelper.accessor("positionsAmount", {
        header: "Positions Amount",
        cell: ({ row }) => {
          return (
            <Text fw={500} fs="p5" lh="s" color={getToken("text.high")}>
              {row.original.positionsAmount}
            </Text>
          )
        },
      }),

      assetsColumnHelper.display({
        id: "actions",
        size: 50,
        cell: ({ row }) => {
          return (
            <Button variant="secondary" size="small" asChild>
              <Link
                to="/borrow/multiply/$id"
                params={{
                  id:
                    MULTIPLY_ASSETS_CONFIG.find(
                      (config) =>
                        config.collateralAssetId ===
                        row.original.suppliedAssetId,
                    )?.id ?? "",
                }}
              >
                Go to pair
              </Link>
            </Button>
          )
        },
      }),
    ],
    [getRelatedAToken, t, isMobile],
  )
}

export const getStrategyPositionsColumnsVisibility = (isMobile: boolean) => ({
  underlyingAssetId: true,
  netWorth: true,
  avgApy: !isMobile,
  positionsAmount: !isMobile,
  actions: !isMobile,
})
