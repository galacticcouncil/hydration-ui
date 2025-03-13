import { Button } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { SAssetDetailMobileActions } from "@/modules/wallet/MyAssets/AssetDetailMobileActions.styled"

export const AssetDetailMobileActions = () => {
  const { t } = useTranslation()

  return (
    <SAssetDetailMobileActions>
      <Button size="large">{t("deposit")}</Button>
      <Button variant="tertiary" size="large">
        {t("withdraw")}
      </Button>
      <Button variant="tertiary" size="large">
        {t("trade")}
      </Button>
      <Button variant="tertiary" size="large">
        {t("transfer")}
      </Button>
    </SAssetDetailMobileActions>
  )
}
