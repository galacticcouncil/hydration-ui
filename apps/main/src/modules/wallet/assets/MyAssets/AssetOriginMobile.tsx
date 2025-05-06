import { Amount } from "@galacticcouncil/ui/components"
import { AnyChain } from "@galacticcouncil/xcm-core"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly origin: AnyChain | null
}

export const AssetOriginMobile: FC<Props> = ({ origin }) => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <Amount
      variant="horizontalLabel"
      label={t("myAssets.expandedAsset.assetOrigin")}
      value={origin?.name || t("common:unknown")}
    />
  )
}
