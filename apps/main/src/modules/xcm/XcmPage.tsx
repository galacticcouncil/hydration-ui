import { Button, Flex } from "@galacticcouncil/ui/components"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"

import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const XcmPage = () => {
  const { createTransaction } = useTransactionsStore()
  const { papi, tradeRouter, tradeUtils } = useRpcProvider()

  const { isConnected } = useAccount()

  const { mutate: swap, isPending: isSwapPending } = useMutation({
    mutationFn: async () => {
      // example of swap using sdk-next
      const sell = await tradeRouter.getBestSell(5, 0, 10_000_000_000n)
      const callData = await tradeUtils.buildSellTx(sell)

      return createTransaction({
        title: "Swap Test",
        tx: await papi.txFromCallData(callData),
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
        </>
      ) : (
        <Web3ConnectButton size="large" />
      )}
    </Flex>
  )
}
