import { useWormholeTransfersQuery } from "api/wormhole"
import { ToastSidebarGroup } from "components/Toast/sidebar/group/ToastSidebarGroup"
import { ToastContent } from "components/Toast/ToastContent"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { RedeemButton } from "sections/wallet/assets/wormhole/components/RedeemButton"
import { useWormholeRedeemStore } from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const ImportantToasts = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { data: transfers } = useWormholeTransfersQuery(
    account?.address ?? "",
    "redeemable",
  )

  const pendingRedeemIds = useWormholeRedeemStore(
    (state) => state.pendingRedeemIds,
  )

  const toasts = useMemo(() => {
    if (!transfers) return []
    return transfers
      .filter((transfer) => !pendingRedeemIds.includes(transfer.operation.id))
      .map((transfer) => {
        return (
          <ToastContent
            key={transfer.operation.id}
            dateCreated={new Date(transfer.operation.sourceChain.timestamp)}
            variant="info"
            title={
              <span className="highlight">
                {t("wormhole.tx.claim.description", {
                  symbol: transfer.assetSymbol,
                  amount: transfer.amount,
                  chain: transfer.toChain.name,
                })}
              </span>
            }
            actions={<RedeemButton transfer={transfer} />}
          />
        )
      })
  }, [pendingRedeemIds, t, transfers])

  if (!toasts.length) return null
  return (
    <ToastSidebarGroup title={t("toast.sidebar.important.title")} open>
      <div sx={{ flex: "column", gap: 6 }}>{toasts}</div>
    </ToastSidebarGroup>
  )
}
