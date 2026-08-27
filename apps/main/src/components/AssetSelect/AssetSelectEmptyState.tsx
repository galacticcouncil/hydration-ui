import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState/EmptyState"

export const AssetSelectEmptyState: FC = () => {
  const { t } = useTranslation()

  return (
    <EmptyState
      header={t("assetSelector.empty.mainText")}
      description={t("assetSelector.empty.secondaryText")}
    />
  )
}
