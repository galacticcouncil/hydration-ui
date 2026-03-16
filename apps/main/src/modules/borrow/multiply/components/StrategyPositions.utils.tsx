import { pureCreatedEventsQuery } from "@galacticcouncil/indexer/indexer"
import { AssetLabel, Button, Flex } from "@galacticcouncil/ui/components"
import { Amount } from "@galacticcouncil/ui/components/Amount"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { Enum } from "polkadot-api"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { useStrategyPositions } from "@/api/borrow/queries"
import { useIndexerClient } from "@/api/provider"
import { createProxyCall } from "@/api/proxy"
import { AssetLogo } from "@/components/AssetLogo"
import { RESERVE_LOGO_OVERRIDE_MAP } from "@/modules/borrow/reserve/components/ReserveLabel"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export type StrategyPositionsData = {
  proxyAddress: string
  publicKey: string
  underlyingAssetAddress: string
  underlyingAssetId: string
  balance: string
  displayBalance: string
  symbol: string
  createdAt: Date
  netApy: number
  netWorth: string
  healthFactor: string
}

export type StrategyPositionsGroupedData = {
  underlyingAssetId: string
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
        underlyingAssetAddress:
          position.borrowSummaryData.reserve.underlyingAsset,
        underlyingAssetId: getAssetIdFromAddress(
          position.borrowSummaryData.reserve.underlyingAsset,
        ),
        balance: position.borrowSummaryData.underlyingBalance,
        displayBalance: position.borrowSummaryData.underlyingBalanceUSD,
        symbol: position.borrowSummaryData.reserve.symbol,
        createdAt: position.proxyCreatedAt,
        netApy: position.netApy,
        netWorth: position.netWorth,
        healthFactor: position.healthFactor,
      }),
    )

    return Object.entries(
      Object.groupBy(positions, (position) => position.underlyingAssetId),
    ).map(([underlyingAssetId, positions = []]) => {
      const {
        totalBalance,
        totalDisplayBalance,
        totalNetWorth,
        totalWeightedApy,
        totalHealthFactor,
      } = positions.reduce(
        (acc, p) => ({
          totalBalance: acc.totalBalance.plus(p.balance),
          totalDisplayBalance: acc.totalDisplayBalance.plus(p.displayBalance),
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
        underlyingAssetId,
        positions,
        symbol: positions[0]?.symbol ?? "",
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

export const useClosePositions = () => {
  const queryClient = useQueryClient()
  const indexerClient = useIndexerClient()
  const rpc = useRpcProvider()
  const { createTransaction } = useTransactionsStore()
  const { account } = useAccount()
  const { getRelatedAToken } = useAssets()

  return useMutation({
    mutationFn: async (position: StrategyPositionsData) => {
      if (!account) throw new Error("No account found")

      const aToken = getRelatedAToken(position.underlyingAssetId)

      if (!aToken) throw new Error("No aToken found")

      const { events } = await queryClient.fetchQuery(
        pureCreatedEventsQuery(indexerClient, position.publicKey),
      )

      const event = events[0]

      if (!event || !event.extrinsic) throw new Error("No event found")

      const proxyCreateData = {
        blockHeight: event.block.height,
        extrinsicIndex: event.extrinsic.indexInBlock,
      }

      //@TODO: add unlooping

      const balance = await rpc.sdk.client.balance.getErc20Balance(
        position.proxyAddress,
        Number(aToken.id),
      )
      const transferableBalance = balance.transferable

      if (transferableBalance === 0n) {
        throw new Error("No balance to transfer")
      }

      const transfetBalanceTx = rpc.papi.tx.Dispatcher.dispatch_with_extra_gas({
        call: rpc.papi.tx.Currencies.transfer({
          currency_id: Number(aToken.id),
          dest: account.address,
          amount: transferableBalance,
        }).decodedCall,
        extra_gas: AAVE_GAS_LIMIT,
      })

      const killProxyTx = rpc.papi.tx.Proxy.kill_pure({
        spawner: account.address,
        index: 0,
        height: proxyCreateData.blockHeight,
        ext_index: proxyCreateData.extrinsicIndex,
        proxy_type: Enum("Any"),
      })

      const toasts = {
        submitted: "Killing proxy",
        success: "Proxy killed",
      }

      await createTransaction({
        tx: createProxyCall(
          rpc.papi,
          position.proxyAddress,
          rpc.papi.tx.Utility.batch_all({
            calls: [transfetBalanceTx.decodedCall, killProxyTx.decodedCall],
          }).decodedCall,
        ),
        toasts,
      })
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
      assetsColumnHelper.accessor("underlyingAssetId", {
        header: "Position",
        cell: ({
          row: {
            original: { underlyingAssetId, symbol },
          },
        }) => {
          const ovverideIconId = RESERVE_LOGO_OVERRIDE_MAP[underlyingAssetId]

          const logoId = ovverideIconId ?? underlyingAssetId
          const symbol_ = ovverideIconId
            ? (getRelatedAToken(underlyingAssetId)?.symbol ?? symbol)
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
      }),

      assetsColumnHelper.display({
        id: "actions",
        size: 50,
        cell: ({ row }) => {
          return (
            <Button variant="secondary" size="small" asChild>
              <Link
                to="/borrow/multiply/$id"
                params={{ id: row.original.underlyingAssetId }}
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

export const getStratgiesColumnsVisibility = (isMobile: boolean) => ({
  underlyingAssetId: true,
  netWorth: true,
  avgApy: !isMobile,
  positionsAmount: !isMobile,
  actions: !isMobile,
})
