import { Button, Grid, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"

type Props = {
  readonly isSingleTrade: boolean
  readonly isEnabled: boolean
}

export const MarketFooter: FC<Props> = ({ isSingleTrade, isEnabled }) => {
  const { t } = useTranslation("trade")

  return (
    <Grid rowGap={12} p={20}>
      <AuthorizedAction size="large">
        <Button type="submit" size="large" disabled={!isEnabled}>
          {isSingleTrade ? t("market.footer.swap") : t("market.twap.cta")}
        </Button>
      </AuthorizedAction>

      <Text
        sx={{ textAlign: "center" }}
        fs="p5"
        fw={400}
        color={getToken("text.high")}
      >
        {t("market.footer.description")}
      </Text>
    </Grid>
  )
}
