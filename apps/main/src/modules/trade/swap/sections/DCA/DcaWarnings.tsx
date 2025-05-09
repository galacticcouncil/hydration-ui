import { Alert } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetType } from "@/api/assets"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"

export const DcaWarnings: FC = () => {
  const { t } = useTranslation("trade")
  const { watch } = useFormContext<DcaFormValues>()
  const sellAsset = watch("sellAsset")

  if (sellAsset?.type === AssetType.ERC20) {
    return <Alert variant="warning" description={t("market.warn.aToken")} />
  }
}
