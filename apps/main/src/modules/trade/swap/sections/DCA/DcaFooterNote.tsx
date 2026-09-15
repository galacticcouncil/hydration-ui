import { HealthFactorResult } from "@galacticcouncil/money-market/utils"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/sor"
import { Grid, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DcaTradeMeta } from "@/modules/trade/swap/sections/DCA/DcaTradeMeta"

type Props = {
  readonly isOpenBudget: boolean
  readonly order: TradeDcaOrder | undefined | null
  readonly healthFactor: HealthFactorResult | undefined
  readonly priceImpactLevel: "error" | "warning" | undefined
}

export const DcaFooterNote: FC<Props> = ({
  isOpenBudget,
  order,
  healthFactor,
  priceImpactLevel,
}) => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <Grid justifyItems="center">
      {order && (
        <DcaTradeMeta
          order={order}
          healthFactor={healthFactor}
          priceImpactLevel={priceImpactLevel}
        />
      )}
      <Text fs="p5" lh={1.4} py="m" color={getToken("text.high")}>
        {t(
          isOpenBudget
            ? "trade:dca.footer.message.open"
            : "trade:dca.footer.message",
        )}
      </Text>
    </Grid>
  )
}
