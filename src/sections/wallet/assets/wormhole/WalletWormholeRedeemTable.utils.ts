import { HYDRADX_PARACHAIN_ID } from "@galacticcouncil/sdk"
import {
  assetsMap,
  chainsMap,
  HydrationConfigService,
  routesMap,
} from "@galacticcouncil/xcm-cfg"
import {
  AnyChain,
  EvmChain,
  Parachain,
  SolanaChain,
} from "@galacticcouncil/xcm-core"
import { EvmCall, WormholeTransfer } from "@galacticcouncil/xcm-sdk"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { QUERY_KEYS } from "utils/queryKeys"

export const getChainId = (chain: AnyChain) => {
  if (chain instanceof SolanaChain) {
    return chain.id
  }
  if (chain instanceof EvmChain) {
    return chain.evmChain.id
  }
  if (chain instanceof Parachain) {
    return chain.parachainId
  }
}

export const useWormholeTransfersApi = () => {
  return useMemo(() => {
    const configService = new HydrationConfigService({
      assets: assetsMap,
      chains: chainsMap,
      routes: routesMap,
    })
    return new WormholeTransfer(configService, HYDRADX_PARACHAIN_ID)
  }, [])
}

type WormholeRedeemVariables = {
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
            queryClient.refetchQueries({
              queryKey: QUERY_KEYS.wormholeTransfers(address),
            })
          },
          rejectOnClose: true,
        },
      )
    },
  })
}
