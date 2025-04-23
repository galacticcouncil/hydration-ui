import { Button, Grid } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const LiquidityDetailMobileActions = () => {
  const { t } = useTranslation("wallet")

  return (
    <Grid columnGap={8} sx={{ gridTemplateColumns: "1fr 1fr" }}>
      <Button size="large">{t("myLiquidity.actions.poolDetails")}</Button>
      <Button variant="tertiary" size="large">
        {t("myLiquidity.actions.addLiquidity")}
      </Button>
    </Grid>
  )
}
