import { AnyChain, EvmChain, Parachain } from "@galacticcouncil/xcm-core"
import { EvmCall, Operation, WhTransfer } from "@galacticcouncil/xcm-sdk"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { QUERY_KEYS } from "utils/queryKeys"

export const getChainId = (chain: AnyChain) => {
  switch (true) {
    case chain instanceof EvmChain:
      return chain.evmChain.id
    case chain instanceof Parachain:
      return chain.parachainId
    default:
      return chain.id
  }
}

type WormholeRedeemVariables = {
  operation: Operation
  amount: string
  symbol: string
  chain: AnyChain
  call: EvmCall
}

export const useWormholeRedeem = (address: string) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { createTransaction } = useStore()
  return useMutation({
    mutationFn: async ({
      operation,
      call,
      amount,
      symbol,
      chain,
    }: WormholeRedeemVariables) => {
      const { abi, ...tx } = call

      return createTransaction(
        {
          title: t("wormhole.tx.redeem.title", { symbol }),
          description: t("wormhole.tx.redeem.description", {
            amount,
            symbol,
            chain: chain.name,
          }),
          evmTx: {
            chain: chain.key,
            data: {
              data: tx.data,
              to: tx.to,
            },
            abi,
          },
        },
        {
          toast: createToastMessages("wormhole.tx.redeem.toast", {
            t,
            tOptions: {
              amount,
              symbol,
              chain: chain.name,
            },
            components: ["span.highlight"],
          }),
          onSuccess: () => {
            const transfers = queryClient.getQueryData<WhTransfer[]>(
              QUERY_KEYS.wormholeTransfers(address),
            )

            if (transfers) {
              // optimistically remove the transfer from the query cache
              queryClient.setQueryData<WhTransfer[]>(
                QUERY_KEYS.wormholeTransfers(address),
                transfers.filter(
                  (transfer) => transfer.operation.id !== operation.id,
                ),
              )
            }
          },
          rejectOnClose: true,
        },
      )
    },
  })
}
