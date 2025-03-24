import { Button } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SAssetDetailMobileActions } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileActions.styled"

export type AssetDetailMobileAction =
  | "deposit"
  | "withdraw"
  | "trade"
  | "transfer"

type Props = {
  readonly onActionOpen: (action: AssetDetailMobileAction) => void
}

export const AssetDetailMobileActions: FC<Props> = ({ onActionOpen }) => {
  const { t } = useTranslation()

  return (
    <SAssetDetailMobileActions>
      <Button size="large" onClick={() => onActionOpen("deposit")}>
        {t("deposit")}
      </Button>
      <Button
        variant="tertiary"
        size="large"
        onClick={() => onActionOpen("withdraw")}
      >
        {t("withdraw")}
      </Button>
      <Button
        variant="tertiary"
        size="large"
        onClick={() => onActionOpen("trade")}
      >
        {t("trade")}
      </Button>
      <Button
        variant="tertiary"
        size="large"
        onClick={() => onActionOpen("transfer")}
      >
        {t("transfer")}
      </Button>
    </SAssetDetailMobileActions>
  )
}
