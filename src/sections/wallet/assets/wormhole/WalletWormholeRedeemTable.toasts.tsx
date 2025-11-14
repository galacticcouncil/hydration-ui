import { WhTransfer } from "@galacticcouncil/xcm-sdk"
import { useMemo, useRef } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useWormholeRedeemStore } from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useToast } from "state/toasts"

export const useWormholeToastCallbacks = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { setPendingId } = useWormholeRedeemStore()

  const pendingToastId = useRef<string | undefined>()

  const toast = useToast()
  return useMemo(() => {
    return {
      onLoading: (transfer: WhTransfer, txHash: string, link?: string) => {
        setPendingId(transfer.operation.id)
        const toastId = toast.loading(
          {
            link,
            txHash,
            xcm: transfer.toChain.isSolana()
              ? "solana"
              : transfer.toChain.isEvmChain()
                ? "evm"
                : undefined,
            title: (
              <Trans
                t={t}
                i18nKey="wormhole.tx.claim.toast.onLoading"
                tOptions={{
                  symbol: transfer.assetSymbol,
                  amount: transfer.amount,
                  chain: transfer.toChain.name,
                }}
              >
                <span className="highlight" />
              </Trans>
            ),
          },
          account?.address,
        )
        pendingToastId.current = toastId
      },
      onSuccess: (transfer: WhTransfer, link?: string) => {
        toast.success(
          {
            id: pendingToastId.current,
            link,
            title: (
              <Trans
                t={t}
                i18nKey="wormhole.tx.claim.toast.onSuccess"
                tOptions={{
                  symbol: transfer.assetSymbol,
                  amount: transfer.amount,
                  chain: transfer.toChain.name,
                }}
              >
                <span className="highlight" />
              </Trans>
            ),
          },
          account?.address,
        )
      },
      onError: (transfer: WhTransfer, link?: string) => {
        if (pendingToastId.current) {
          toast.removeToast(pendingToastId.current)
        }
        toast.error(
          {
            id: pendingToastId.current,
            title: (
              <Trans
                t={t}
                i18nKey="wormhole.tx.claim.toast.onLoading"
                tOptions={{
                  symbol: transfer.assetSymbol,
                  amount: transfer.amount,
                  chain: transfer.toChain.name,
                }}
              >
                <span className="highlight" />
              </Trans>
            ),
          },
          account?.address,
        )
      },
    }
  }, [account?.address, setPendingId, t, toast])
}
