import { Plus } from "@galacticcouncil/ui/assets/icons"
import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { Button } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"
import { LINKS } from "@/config/navigation"

export const MyAssetsEmptyState: FC = () => {
  const { t } = useTranslation(["wallet"])

  return (
    <EmptyState
      sx={{ py: "xxxl" }}
      image={NoFunds}
      header={t("wallet:myAssets.emptyState.header")}
      description={t("wallet:myAssets.emptyState.description")}
      action={
        <Button variant="secondary" asChild>
          <Link to={LINKS.deposit}>
            <Plus />
            {t("wallet:myAssets.emptyState.cta")}
          </Link>
        </Button>
      }
    />
  )
}
