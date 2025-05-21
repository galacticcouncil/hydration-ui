import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState/EmptyState"

export const OrdersEmptyState: FC = () => {
  const { t } = useTranslation("trade")

  return (
    <EmptyState
      header={t("trade.orders.emptyState.header")}
      description={t("trade.orders.emptyState.description")}
    />
  )
}
