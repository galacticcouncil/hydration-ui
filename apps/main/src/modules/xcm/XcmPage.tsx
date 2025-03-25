import { PoolType } from "@galacticcouncil/sdk"
import { Button, Flex } from "@galacticcouncil/ui/components"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import {
  assetsMap,
  chainsMap,
  dex,
  HydrationConfigService,
  routesMap,
  validations,
} from "@galacticcouncil/xcm-cfg"
import { Wallet } from "@galacticcouncil/xcm-sdk"
import { useMutation } from "@tanstack/react-query"
import { Enum } from "polkadot-api"
import { useMemo } from "react"

import { transformPjsToPapiTx } from "@/modules/transactions/TransactionProvider.utils"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const useCrossChainWallet = () => {
  const { poolService } = useRpcProvider()

  return useMemo(() => {
    const configService = new HydrationConfigService({
      assets: assetsMap,
      chains: chainsMap,
      routes: routesMap,
    })

    const wallet = new Wallet({
      configService: configService,
      transferValidations: validations,
    })

    // Register chain swaps
    const hydration = configService.getChain("hydration")
    const assethub = configService.getChain("assethub")
    const assethubCex = configService.getChain("assethub_cex")

    wallet.registerDex(
      new dex.HydrationDex(hydration, poolService),
      new dex.AssethubDex(assethub),
      new dex.AssethubDex(assethubCex),
    )

    return wallet
  }, [])
}

// @TODO remove when migrated to sdk-next
function poolTypeToEnumPoolType(poolType: PoolType) {
  switch (poolType) {
    case PoolType.LBP:
      return "LBP"
    case PoolType.XYK:
      return "XYK"
    case PoolType.Omni:
      return "Omnipool"
    case PoolType.Stable:
      return "Stableswap"
  }
}

export const XcmPage = () => {
  const { createTransaction } = useTransactionsStore()
  const { api, papi, tradeRouter } = useRpcProvider()

  const wallet = useCrossChainWallet()

  const { isConnected } = useAccount()

  const { mutate: swap, isPending: isSwapPending } = useMutation({
    mutationFn: async () => {
      const trade = await tradeRouter.getBestSell("0", "10", "5")

      return createTransaction({
        title: "Swap Test",
        tx: papi.tx.Router.sell({
          asset_in: 0,
          asset_out: 10,
          amount_in: BigInt(trade.amountIn.toString()),
          min_amount_out: BigInt("60948"),
          route: trade.swaps.map((swap) => ({
            pool: Enum(
              poolTypeToEnumPoolType(swap.pool),
              swap?.poolId ? Number(swap.poolId) : undefined,
            ),
            asset_in: Number(swap.assetIn),
            asset_out: Number(swap.assetOut),
          })),
        }),
      })
    },
  })

  const { mutate: transfer, isPending: isTransferPending } = useMutation({
    mutationFn: async () => {
      return createTransaction({
        title: "Transfer Test",
        tx: papi.tx.Currencies.transfer({
          dest: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
          amount: 5000000000000n,
          currency_id: 0,
        }),
        toasts: {
          submitted: "Transfer Test submitted",
          success: "Transfer Test success",
          error: "Transfer Test error",
        },
      })
    },
  })

  const { mutate: xcmEvmInTransfer, isPending: isXcmEvmInPending } =
    useMutation({
      mutationFn: async () => {
        const srcChainKey = "moonbeam"
        const dstChainKey = "hydration"

        const transfer = await wallet.transfer(
          "glmr",
          "0x19912230039c10861946df36cde0efef09c3894a",
          srcChainKey,
          "7KATdGajG9RVHQtcVJJKsv6PUL7KZC8Znt3j39kX1nvGYyiA",
          dstChainKey,
        )

        const { source, destination } = transfer

        return createTransaction({
          title: "XCM Test",
          description: "Moonbeam -> Hydration",
          tx: await transfer.buildCall("1"),
          toasts: {
            submitted: "XCM Transfer submitted",
            success: "XCM Transfer success",
            error: "XCM Transfer error",
          },
          meta: {
            chainKey: srcChainKey,
            fee: source.fee.toDecimal(source.fee.decimals),
            feeBalance: source.feeBalance.toDecimal(source.fee.decimals),
            feeSymbol: source.fee.originSymbol,
            dstChainKey: dstChainKey,
            dstChainFee: destination.fee.toDecimal(destination.fee.decimals),
            dstChainFeeSymbol: destination.fee.originSymbol,
          },
        })
      },
    })

  const { mutate: xcmOutTransfer, isPending: isXcmOutPending } = useMutation({
    mutationFn: async () => {
      const srcChainKey = "hydration"
      const dstChainKey = "moonbeam"

      const transfer = await wallet.transfer(
        "glmr",
        "7KATdGajG9RVHQtcVJJKsv6PUL7KZC8Znt3j39kX1nvGYyiA",
        srcChainKey,
        "0x19912230039c10861946df36cde0efef09c3894a",
        dstChainKey,
      )

      const { destination } = transfer

      const call = await transfer.buildCall("1")

      return createTransaction({
        title: "XCM Test",
        description: "Hydration -> Moonbeam",
        tx: await transformPjsToPapiTx(api, papi, call),
        toasts: {
          submitted: "XCM Transfer submitted",
          success: "XCM Transfer success",
          error: "XCM Transfer error",
        },
        meta: {
          chainKey: srcChainKey,
          dstChainKey: dstChainKey,
          dstChainFee: destination.fee.toDecimal(destination.fee.decimals),
          dstChainFeeSymbol: destination.fee.originSymbol,
        },
      })
    },
  })

  return (
    <Flex direction="column" gap={20}>
      {isConnected ? (
        <>
          <Button size="large" onClick={() => swap()} disabled={isSwapPending}>
            Swap
          </Button>
          <Button
            size="large"
            onClick={() => transfer()}
            disabled={isTransferPending}
          >
            Transfer
          </Button>
          <Button
            size="large"
            onClick={() => xcmEvmInTransfer()}
            disabled={isXcmEvmInPending}
          >
            {"XCM Moonbeam -> Hydration (EVM)"}
          </Button>
          <Button
            size="large"
            onClick={() => xcmOutTransfer()}
            disabled={isXcmOutPending}
          >
            {"XCM Hydration -> Moonbeam"}
          </Button>
        </>
      ) : (
        <Web3ConnectButton size="large" />
      )}
    </Flex>
  )
}
