import { Plus } from "@galacticcouncil/ui/assets/icons"
import NoPositions from "@galacticcouncil/ui/assets/images/NoPositions.png"
import { Button } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"

export const MyLiquidityEmptyState: FC = () => {
  const { t } = useTranslation(["wallet"])

  return (
    <EmptyState
      sx={{ py: 80 }}
      image={NoPositions}
      header={t("wallet:myLiquidity.emptyState.header")}
      description={t("wallet:myLiquidity.emptyState.description")}
      action={
        <Button variant="secondary" asChild>
          <Link to="/liquidity">
            <Plus />
            {t("wallet:myLiquidity.emptyState.cta")}
          </Link>
        </Button>
      }
    />
  )
}
