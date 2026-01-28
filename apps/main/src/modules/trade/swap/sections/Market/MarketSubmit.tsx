import { Grid, LoadingButton } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"

type Props = {
  readonly isSingleTrade: boolean
  readonly isEnabled: boolean
  readonly isLoading: boolean
}

export const MarketSubmit: FC<Props> = ({
  isSingleTrade,
  isEnabled,
  isLoading,
}) => {
  const { t } = useTranslation("trade")

  return (
    <Grid py="xl">
      <AuthorizedAction size="large">
        <LoadingButton
          type="submit"
          size="large"
          disabled={!isEnabled || isLoading}
          isLoading={isLoading}
        >
          {isSingleTrade ? t("market.footer.swap") : t("market.twap.cta")}
        </LoadingButton>
      </AuthorizedAction>
    </Grid>
  )
}
