import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"

export const MyBondsEmptyState: FC = () => {
  const { t } = useTranslation("wallet")

  return (
    <EmptyState
      sx={{ py: "xxxl" }}
      image={NoFunds}
      header={t("myBonds.emptyState.header")}
      description={t("myBonds.emptyState.description")}
    />
  )
}
