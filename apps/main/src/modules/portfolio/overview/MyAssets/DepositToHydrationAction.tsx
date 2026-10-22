import { Button, TableRowAction } from "@galacticcouncil/ui/components"
import { AnyChain } from "@galacticcouncil/xc-core"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"

type DepositAsset = {
  readonly canDeposit?: boolean
  readonly origin: AnyChain | null
  readonly xcAssetKey?: string
}

export const canDepositToHydration = (asset: DepositAsset) =>
  Boolean(asset.canDeposit && asset.origin && asset.xcAssetKey)

export const DepositToHydrationTableAction: FC<{
  readonly asset: DepositAsset
}> = ({ asset }) => {
  const { t } = useTranslation("wallet")

  if (!canDepositToHydration(asset)) return null

  return (
    <TableRowAction asChild>
      <Link
        to={LINKS.crossChain}
        search={{
          srcChain: asset.origin!.key,
          srcAsset: asset.xcAssetKey!,
        }}
      >
        {t("myAssets.actions.depositToHydration")}
      </Link>
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
      asChild
      variant="muted"
      outline
      sx={{ gridColumn: "1 / -1" }}
    >
      <Link
        to={LINKS.crossChain}
        search={{
          srcChain: asset.origin!.key,
          srcAsset: asset.xcAssetKey!,
        }}
      >
        {t("myAssets.actions.depositToHydration")}
      </Link>
    </Button>
  )
}
