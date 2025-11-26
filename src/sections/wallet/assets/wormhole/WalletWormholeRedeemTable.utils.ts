import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AnyChain, Parachain, SolanaChain } from "@galacticcouncil/xcm-core"
import {
  Call,
  EvmCall,
  SolanaCall,
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
import { useWormholeToastCallbacks } from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.toasts"
import { EthereumSigner } from "sections/web3-connect/signer/EthereumSigner"
import { SolanaSigner } from "sections/web3-connect/signer/SolanaSigner"
import { WalletAccount } from "sections/web3-connect/types"
import { TransactionInput, useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { HYDRATION_CHAIN_KEY } from "utils/constants"
import { getEvmTxLink } from "utils/evm"
import {
  getSolanaJitoBundleLink,
  getSolanaTxLink,
  waitForSolanaBundle,
  waitForSolanaTx,
} from "utils/solana"
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
  call: Call | Call[]
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

export const useWormholeWithdrawRedeem = (
  options: {
    onSubmitted?: () => void
  } = {},
) => {
  const { setPendingId } = useWormholeRedeemStore()

  const toast = useWormholeToastCallbacks()

  return useMutation({
    mutationFn: async ([transfer, account]: [WhTransfer, WalletAccount]) => {
      const { operation, toChain, redeem } = transfer

      if (!account) throw new Error("Account is not connected")
      if (!redeem) throw new Error("Transfer is not redeemable")

      const call = await redeem(account.address)

      if (
        account.signer instanceof SolanaSigner &&
        toChain instanceof SolanaChain
      ) {
        const isBatch = Array.isArray(call)
        if (isBatch) {
          const { bundleId, lilJit } = await account.signer.signAndSendBatch(
            call as SolanaCall[],
            toChain as SolanaChain,
            () => toast.onError(transfer),
          )
          options.onSubmitted?.()
          setPendingId(operation.id)
          toast.onLoading(transfer, getSolanaJitoBundleLink(bundleId))
          try {
            await waitForSolanaBundle(lilJit, bundleId)
            toast.onSuccess(transfer, getSolanaJitoBundleLink(bundleId))
          } catch (error) {
            toast.onError(transfer, getSolanaJitoBundleLink(bundleId))
          }
        } else {
          const { data, signers } = call as SolanaCall

          const { signature } = await account.signer.signAndSend(data, signers)
          options.onSubmitted?.()
          setPendingId(operation.id)
          toast.onLoading(transfer, getSolanaTxLink(signature))
          try {
            await waitForSolanaTx(toChain.connection, signature)
            toast.onSuccess(transfer, getSolanaTxLink(signature))
          } catch (error) {
            toast.onError(transfer, getSolanaTxLink(signature))
          }
        }
      }

      if (account.signer instanceof EthereumSigner) {
        const { data, from, to } = call as EvmCall

        const tx = await account.signer.sendTransaction(
          { data, from, to },
          {
            chain: toChain.key,
          },
        )

        const link = getEvmTxLink(tx.hash, tx.data, toChain.key)
        toast.onLoading(transfer, tx.hash, link)

        const receipt = await tx.wait()

        if (receipt.status === 0) {
          toast.onError(transfer, link)
        } else {
          toast.onSuccess(transfer, link)
        }

        setPendingId(operation.id)
      }
    },
  })
}

export const useWormholeDepositRedeem = (address: string) => {
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
