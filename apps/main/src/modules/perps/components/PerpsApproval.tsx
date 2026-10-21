import { tenthsBpsToPercent } from "@galacticcouncil/hyperliquid/config"
import { useApproveBuilderFee } from "@galacticcouncil/hyperliquid/hooks"
import { Alert, Button } from "@galacticcouncil/ui/components"
import { isEthereumSigner, useWallet } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HYPERLIQUID } from "@/config/hyperliquid"
import {
  useBuilderApproval,
  useHyperliquidAccount,
} from "@/modules/perps/PerpsPage.data"

export const PerpsApproval: FC = () => {
  const { t } = useTranslation("trade")
  const wallet = useWallet()
  const { exists, isLoading: isAccountLoading } = useHyperliquidAccount()
  const { isApproved, isLoading } = useBuilderApproval()

  const approve = useApproveBuilderFee({
    isTestnet: HYPERLIQUID.isTestnet,
    builder: HYPERLIQUID.builder,
    maxFeeTenthsBps: HYPERLIQUID.maxFee,
  })

  const signer = wallet?.signer

  if (
    isLoading ||
    isAccountLoading ||
    isApproved ||
    !isEthereumSigner(signer)
  ) {
    return null
  }

  // Hyperliquid rejects every action from an address that has never
  // deposited, so offering the approval here would only fail opaquely.
  if (!exists) {
    return (
      <Alert
        variant="info"
        title={t("perps.approval.deposit.title")}
        description={t("perps.approval.deposit.description")}
      />
    )
  }

  return (
    <Alert
      variant={approve.isError ? "error" : "warning"}
      title={t("perps.approval.title")}
      description={
        approve.isError
          ? t("perps.approval.error", { error: approve.error.message })
          : t("perps.approval.description", {
              fee: tenthsBpsToPercent(HYPERLIQUID.fee),
              max: tenthsBpsToPercent(HYPERLIQUID.maxFee),
            })
      }
      action={
        <Button
          size="small"
          variant="primary"
          disabled={approve.isPending}
          onClick={() =>
            approve.mutate({
              address: signer.address,
              provider: signer.provider,
            })
          }
        >
          {approve.isPending
            ? t("perps.approval.pending")
            : t("perps.approval.cta")}
        </Button>
      }
    />
  )
}
