import { useWormholeTransfersQuery } from "api/wormhole"
import { ToastSidebarGroup } from "components/Toast/sidebar/group/ToastSidebarGroup"
import { ToastContent } from "components/Toast/ToastContent"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { RedeemButton } from "sections/wallet/assets/wormhole/components/RedeemButton"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export type WalletWormholeRedeemManagerProps = {}

export const ImportantToasts: React.FC<
  WalletWormholeRedeemManagerProps
> = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { data: transfers } = useWormholeTransfersQuery(account, "redeemable")

  const toasts = useMemo(() => {
    if (!transfers) return []
    return transfers.map((transfer) => {
      return (
        <ToastContent
          key={transfer.operation.id}
          dateCreated={new Date(transfer.operation.sourceChain.timestamp)}
          variant="info"
          title={
            <span className="highlight">
              {t("wormhole.tx.redeem.description", {
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
  }, [t, transfers])

  if (!toasts.length) return null
  return (
    <ToastSidebarGroup title={t("toast.sidebar.important.title")} open>
      <div sx={{ flex: "column", gap: 6 }}>{toasts}</div>
    </ToastSidebarGroup>
  )
}
