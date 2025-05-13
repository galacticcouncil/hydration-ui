import { Button, Grid } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly assetId: string
}

export const LiquidityDetailMobileActions: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation("wallet")

  return (
    <Grid columnGap={8} sx={{ gridTemplateColumns: "1fr 1fr" }}>
      <Button size="large" asChild>
        <Link to={"/liquidity/$id"} params={{ id: assetId }}>
          {t("myLiquidity.actions.poolDetails")}
        </Link>
      </Button>
      {/* TODO add liquidity from wallet */}
      <Button variant="tertiary" size="large">
        {t("myLiquidity.actions.addLiquidity")}
      </Button>
    </Grid>
  )
}
