import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AnyChain, Parachain } from "@galacticcouncil/xcm-core"
import {
  Call,
  EvmCall,
  SubstrateCall,
  Wallet,
  WhTransfer,
} from "@galacticcouncil/xcm-sdk"
import { ApiPromise } from "@polkadot/api"
import { useMutation } from "@tanstack/react-query"
import { useAccountFeePaymentAssets } from "api/payments"
import { useCrossChainWallet } from "api/xcm"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { TransactionInput, useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { HYDRATION_CHAIN_KEY } from "utils/constants"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type WormholeRedeemStore = {
  pendingRedeemIds: string[]
  setPendingId: (id: string) => void
  removePendingId: (id: string) => void
}

export const useWormholeRedeemStore = create(
  persist<WormholeRedeemStore>(
    (set, get) => ({
      pendingRedeemIds: [],
      setPendingId: (id) =>
        set({ pendingRedeemIds: [...get().pendingRedeemIds, id] }),
      removePendingId: (id) =>
        set({
          pendingRedeemIds: get().pendingRedeemIds.filter(
            (redeemId) => id !== redeemId,
          ),
        }),
    }),
    {
      name: "wormhole-redeems",
      version: 1,
    },
  ),
)

const handleHydrationRedeem = async ({
  address,
  call,
  wallet,
  api,
  feePaymentAssetId,
}: {
  api: ApiPromise
  wallet: Wallet
  address: string
  call: SubstrateCall
  feePaymentAssetId?: string
}): Promise<TransactionInput> => {
  const srcChain = chainsMap.get("hydration") as Parachain
  const destChain = chainsMap.get("moonbeam") as Parachain
  const feeAsset = feePaymentAssetId
    ? srcChain.findAssetById(feePaymentAssetId)
    : undefined

  const remoteTx = await wallet.remoteXcm(address, srcChain, destChain, call, {
    srcFeeAsset: feeAsset?.asset,
  })
  return {
    tx: api.tx(remoteTx.data),
  }
}

const handleEthereumRedeem = async ({
  toChain,
  call,
}: {
  toChain: AnyChain
  call: EvmCall
}): Promise<TransactionInput> => {
  const { abi, ...tx } = call

  return {
    evmTx: {
      chain: toChain.key,
      data: {
        data: tx.data,
        to: tx.to,
      },
      abi,
    },
  }
}

export const getWormholeRedeemTx = async ({
  address,
  toChain,
  call,
  wallet,
  api,
  feePaymentAssetId,
}: {
  api: ApiPromise
  wallet: Wallet
  address: string
  call: Call
  toChain: AnyChain
  feePaymentAssetId?: string
}) => {
  switch (toChain.key) {
    case HYDRATION_CHAIN_KEY:
      return handleHydrationRedeem({
        address,
        call: call as SubstrateCall,
        wallet,
        api,
        feePaymentAssetId,
      })

    case "ethereum":
      return handleEthereumRedeem({
        toChain,
        call: call as EvmCall,
      })

    default:
      throw new Error(`Redeem on ${toChain.key} is not supported.`)
  }
}

export const useWormholeRedeem = (address: string) => {
  const { api } = useRpcProvider()
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const wallet = useCrossChainWallet()
  const { feePaymentAssetId } = useAccountFeePaymentAssets()
  const { setPendingId } = useWormholeRedeemStore()

  return useMutation({
    mutationFn: async ({
      operation,
      amount,
      assetSymbol: symbol,
      toChain,
      redeem,
    }: WhTransfer) => {
      if (!redeem) throw new Error("Transfer is not redeemable")

      const call = await redeem(address)

      const txObject = await getWormholeRedeemTx({
        address,
        toChain,
        call,
        wallet,
        api,
        feePaymentAssetId,
      })

      return createTransaction(
        {
          title: t("wormhole.tx.claim.title", { symbol }),
          description: t("wormhole.tx.claim.description", {
            amount,
            symbol,
            chain: toChain.name,
          }),
          ...txObject,
        },
        {
          toast: createToastMessages("wormhole.tx.claim.toast", {
            t,
            tOptions: {
              amount,
              symbol,
              chain: toChain.name,
            },
            components: ["span.highlight"],
          }),
          onSubmitted: () => {
            setPendingId(operation.id)
          },
          onError: () => {},
          rejectOnClose: true,
        },
      )
    },
  })
}
