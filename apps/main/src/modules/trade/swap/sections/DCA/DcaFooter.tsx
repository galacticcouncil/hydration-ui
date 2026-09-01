import { TradeDcaOrder } from "@galacticcouncil/sdk-next/sor"
import { Grid, LoadingButton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { DcaTradeMeta } from "@/modules/trade/swap/sections/DCA/DcaTradeMeta"

type Props = {
  readonly isEnabled: boolean
  readonly isLoading: boolean
  readonly isOpenBudget: boolean
  readonly order: TradeDcaOrder | undefined | null
  readonly priceImpactLevel: "error" | "warning" | undefined
}

export const DcaFooter: FC<Props> = ({
  isEnabled,
  isLoading,
  isOpenBudget,
  order,
  priceImpactLevel,
}) => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <Grid py="xl" rowGap="m" justifyItems="center">
      <AuthorizedAction size="large" width="100%">
        <LoadingButton
          type="submit"
          size="large"
          width="100%"
          disabled={!isEnabled || isLoading}
          isLoading={isLoading}
        >
          {t("schedule")}
        </LoadingButton>
      </AuthorizedAction>
      {order && (
        <DcaTradeMeta order={order} priceImpactLevel={priceImpactLevel} />
      )}
      <Text fs="p5" lh={1.4} color={getToken("text.high")}>
        {t(
          isOpenBudget
            ? "trade:dca.footer.message.open"
            : "trade:dca.footer.message",
        )}
      </Text>
    </Grid>
  )
}
