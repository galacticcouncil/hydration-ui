import { Add } from "@galacticcouncil/ui/assets/icons"
import { Button } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const MyLiquidityActions: FC = () => {
  const { t } = useTranslation("wallet")

  return (
    <Button size="medium" iconStart={Add}>
      {t("myLiquidity.header.cta")}
    </Button>
  )
}
