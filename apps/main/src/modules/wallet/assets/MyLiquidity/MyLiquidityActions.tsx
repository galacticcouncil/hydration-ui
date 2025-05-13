import { Plus } from "@galacticcouncil/ui/assets/icons"
import { Button } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const MyLiquidityActions: FC = () => {
  const { t } = useTranslation("wallet")

  // TODO isolated pool from wallet page
  return (
    <Button size="medium">
      <Plus />
      {t("myLiquidity.header.cta")}
    </Button>
  )
}
