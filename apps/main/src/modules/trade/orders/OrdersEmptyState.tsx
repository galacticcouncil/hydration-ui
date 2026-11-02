import Casette from "@galacticcouncil/ui/assets/images/Casette.webp"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState/EmptyState"

type Props = {
  readonly isError?: boolean
}

export const OrdersEmptyState: FC<Props> = ({ isError }) => {
  const { t } = useTranslation("trade")

  return (
    <EmptyState
      image={isError ? Casette : undefined}
      header={t(
        isError
          ? "trade.orders.errorState.header"
          : "trade.orders.emptyState.header",
      )}
      description={t(
        isError
          ? "trade.orders.errorState.description"
          : "trade.orders.emptyState.description",
      )}
    />
  )
}
