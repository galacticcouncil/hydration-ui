import { Button, TableRowAction } from "@galacticcouncil/ui/components"
import { AnyChain } from "@galacticcouncil/xc-core"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useOnrampModalStore } from "@/modules/onramp/store/useOnrampModalStore"

type DepositAsset = {
  readonly canDeposit?: boolean
  readonly origin: AnyChain | null
  readonly xcAssetKey?: string
}

export const canDepositToHydration = (asset: DepositAsset) =>
  Boolean(asset.canDeposit && asset.origin && asset.xcAssetKey)

const useOpenDeposit = (asset: DepositAsset) => {
  const open = useOnrampModalStore((state) => state.open)
  return () =>
    open("deposit", {
      chainKey: asset.origin!.key,
      assetKey: asset.xcAssetKey!,
    })
}

export const DepositToHydrationTableAction: FC<{
  readonly asset: DepositAsset
}> = ({ asset }) => {
  const { t } = useTranslation("wallet")
  const openDeposit = useOpenDeposit(asset)

  if (!canDepositToHydration(asset)) return null

  return (
    <TableRowAction onClick={openDeposit}>
      {t("myAssets.actions.depositToHydration")}
    </TableRowAction>
  )
}

export const DepositToHydrationButton: FC<{ readonly asset: DepositAsset }> = ({
  asset,
}) => {
  const { t } = useTranslation("wallet")
  const openDeposit = useOpenDeposit(asset)

  if (!canDepositToHydration(asset)) return null

  return (
    <Button
      size="large"
      variant="muted"
      outline
      sx={{ gridColumn: "1 / -1" }}
      onClick={openDeposit}
    >
      {t("myAssets.actions.depositToHydration")}
    </Button>
  )
}
