import { Button, TableRowAction } from "@galacticcouncil/ui/components"
import { AnyChain } from "@galacticcouncil/xc-core"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"

type DepositAsset = {
  readonly canDeposit?: boolean
  readonly origin: AnyChain | null
  readonly xcAssetKey?: string
}

export const canDepositToHydration = (asset: DepositAsset) =>
  Boolean(asset.canDeposit && asset.origin && asset.xcAssetKey)

const openAssetDeposit = (asset: DepositAsset) => {
  if (!canDepositToHydration(asset)) return
  const { openOnchain, depositFlow } = useOnrampModal.getState()
  openOnchain(depositFlow, {
    assetIntent: { chainKey: asset.origin!.key, assetKey: asset.xcAssetKey! },
  })
}

export const DepositToHydrationTableAction: FC<{
  readonly asset: DepositAsset
}> = ({ asset }) => {
  const { t } = useTranslation("wallet")

  if (!canDepositToHydration(asset)) return null

  return (
    <TableRowAction onClick={() => openAssetDeposit(asset)}>
      {t("myAssets.actions.depositToHydration")}
    </TableRowAction>
  )
}

export const DepositToHydrationButton: FC<{ readonly asset: DepositAsset }> = ({
  asset,
}) => {
  const { t } = useTranslation("wallet")

  if (!canDepositToHydration(asset)) return null

  return (
    <Button
      size="large"
      variant="muted"
      outline
      sx={{ gridColumn: "1 / -1" }}
      onClick={() => openAssetDeposit(asset)}
    >
      {t("myAssets.actions.depositToHydration")}
    </Button>
  )
}
