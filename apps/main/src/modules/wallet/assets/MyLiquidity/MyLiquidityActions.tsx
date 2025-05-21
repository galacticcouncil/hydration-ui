import { Plus } from "@galacticcouncil/ui/assets/icons"
import { Button } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const MyLiquidityActions: FC = () => {
  const { t } = useTranslation("wallet")

  return (
    <Button size="medium" asChild>
      <Link to="/liquidity/create">
        <Plus />
        {t("myLiquidity.header.cta")}
      </Link>
    </Button>
  )
}
