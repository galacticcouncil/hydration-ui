import { ArrowDownUp } from "@galacticcouncil/ui/assets/icons"
import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { Icon } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState, EmptyStateAction } from "@/components/EmptyState"

export const MyAssetsEmptyState: FC = () => {
  const { t } = useTranslation(["wallet"])

  return (
    <EmptyState
      sx={{ py: "xxxl" }}
      image={NoFunds}
      header={t("wallet:myAssets.emptyState.header")}
      description={t("wallet:myAssets.emptyState.description")}
      action={
        <EmptyStateAction asChild>
          <Link to="/cross-chain">
            <Icon size="xs" component={ArrowDownUp} />
            {t("wallet:myAssets.emptyState.cta")}
          </Link>
        </EmptyStateAction>
      }
    />
  )
}
