import {
  assetsMap,
  chainsMap,
  routesMap,
  validations,
  dex,
  HydrationConfigService,
} from "@galacticcouncil/xcm-cfg"
import { AssetAmount, SubstrateApis } from "@galacticcouncil/xcm-core"
import { Wallet, Transfer, SubstrateCall } from "@galacticcouncil/xcm-sdk"
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query"
import { TransactionOptions, useStore } from "state/store"
import { isAnyParachain } from "utils/helpers"
import { TRegisteredAsset } from "sections/wallet/addToken/AddToken.utils"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { createToastMessages } from "state/toasts"
import { useRpcProvider } from "providers/rpcProvider"
import { QUERY_KEYS, WS_QUERY_KEYS } from "utils/queryKeys"

type TransferProps = {
  asset: string
  srcAddr: string
  srcChain: string
  dstAddr: string
  dstChain: string
}

export const createXcmAssetKey = (
  id: string,
  symbol: string,
  parachainId: number,
) => {
  return [symbol.toLowerCase(), parachainId, id].join("_")
}

export const syncAssethubXcmConfig = (
  asset: TRegisteredAsset,
  config: HydrationConfigService,
) => {
  config.registerExternal([asset])
}

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
  }, [poolService])
}

export const useCrossChainTransfer = (
  wallet: Wallet,
  transfer: TransferProps,
  options: UseQueryOptions<Transfer> = {},
) => {
  const args = [
    transfer.asset,
    transfer.srcAddr,
    transfer.srcChain,
    transfer.dstAddr,
    transfer.dstChain,
  ] as const
  return useQuery<Transfer>(
    QUERY_KEYS.xcmTransfer(...args),
    async () => {
      return wallet.transfer(...args)
    },
    {
      enabled: !!wallet && !!transfer.asset,
      ...options,
    },
  )
}

type CrossChainTransferOptions = TransactionOptions & {
  title?: string
  description?: string
}

export const useCrossChainTransaction = ({
  title,
  description,
  ...options
}: CrossChainTransferOptions = {}) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()

  return useMutation(
    async (
      values: TransferProps & { amount: number | string; wallet: Wallet },
    ) => {
      const srcChain = chainsMap.get(values.srcChain)
      const dstChain = chainsMap.get(values.dstChain)

      if (!srcChain) throw new Error(`Chain ${values.srcChain} not found`)
      if (!dstChain) throw new Error(`Chain ${values.dstChain} not found`)
      if (!isAnyParachain(srcChain))
        throw new Error(`Chain ${values.srcChain} is not a parachain`)

      const apiPool = SubstrateApis.getInstance()
      const api = await apiPool.api(srcChain.ws)

      const xTransfer = await values.wallet.transfer(
        values.asset,
        values.srcAddr,
        values.srcChain,
        values.dstAddr,
        values.dstChain,
      )

      const { source } = xTransfer
      const { balance, fee, feeBalance, destinationFee } = source

      const call = await xTransfer.buildCall(values.amount)

      const { txOptions } = call as SubstrateCall

      const srcChainName = srcChain.name.replace("(CEX)", "").trim()
      const dstChainName = dstChain.name.replace("(CEX)", "").trim()

      return await createTransaction(
        {
          title: title ?? t("xcm.transfer.reviewTransaction.modal.title"),
          description:
            description ??
            t("xcm.transfer.reviewTransaction.modal.description", {
              amount: values.amount,
              symbol: balance.symbol,
              srcChain: srcChainName,
              dstChain: dstChainName,
            }),
          tx: api.tx(call.data),
          txOptions,
          xcallMeta: {
            srcChain: values.srcChain,
            srcChainFee: fee.toDecimal(fee.decimals),
            srcChainFeeBalance: feeBalance.toDecimal(feeBalance.decimals),
            srcChainFeeSymbol: fee.originSymbol,
            dstChain: values.dstChain,
            dstChainFee: destinationFee.toDecimal(destinationFee.decimals),
            dstChainFeeSymbol: destinationFee.originSymbol,
          },
        },
        {
          ...options,
          toast: createToastMessages("xcm.transfer.toast", {
            t,
            tOptions: {
              amount: values.amount,
              symbol: balance.symbol,
              srcChain: srcChainName,
              dstChain: dstChainName,
            },
            components: ["span.highlight"],
          }),
        },
      )
    },
  )
}

export const useCrossChainBalance = (address: string, chain: string) => {
  const { data, isLoading } = useQuery<AssetAmount[]>(
    WS_QUERY_KEYS.xcmBalance(address, chain),
    {
      enabled: false,
      staleTime: Infinity,
    },
  )

  return {
    data,
    isLoading,
  }
}

export const useCrossChainBalanceSubscription = (
  address: string,
  chain: string,
  onSuccess?: (balances: AssetAmount[]) => void,
) => {
  const wallet = useCrossChainWallet()
  const queryClient = useQueryClient()

  useEffect(() => {
    let subscription:
      | Awaited<ReturnType<typeof wallet.subscribeBalance>>
      | undefined

    async function subscribeBalance() {
      if (!address) return
      if (!chain) return
      subscription = await wallet.subscribeBalance(
        address,
        chain,
        (balances) => {
          onSuccess?.(balances)
          queryClient.setQueryData(
            WS_QUERY_KEYS.xcmBalance(address, chain),
            balances,
          )
        },
      )
    }

    subscribeBalance()

    return () => {
      subscription?.unsubscribe()
    }
  }, [address, chain, onSuccess, queryClient, wallet])
}
