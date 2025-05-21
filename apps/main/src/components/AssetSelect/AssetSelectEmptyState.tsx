import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  EmptyState,
  EmptyStateAction,
} from "@/components/EmptyState/EmptyState"

export const AssetSelectEmptyState: FC = () => {
  const { t } = useTranslation()

  return (
    <EmptyState
      header={t("assetSelector.empty.mainText")}
      description={t("assetSelector.empty.secondaryText")}
      action={
        <EmptyStateAction>
          {t("assetSelector.empty.btn.addAsset")}
        </EmptyStateAction>
      }
    />
  )
}
