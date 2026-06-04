import { Grid, LoadingButton } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"

type Props = {
  readonly isEnabled: boolean
  readonly isLoading: boolean
}

export const LimitSubmit: FC<Props> = ({ isEnabled, isLoading }) => {
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
          {t("limit.submit")}
        </LoadingButton>
      </AuthorizedAction>
    </Grid>
  )
}
