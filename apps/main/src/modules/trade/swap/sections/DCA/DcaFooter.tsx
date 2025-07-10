import { Button, Grid } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"

type Props = {
  readonly isEnabled: boolean
}

export const DcaFooter: FC<Props> = ({ isEnabled }) => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <Grid py={20}>
      <AuthorizedAction size="large">
        <Button type="submit" size="large" disabled={!isEnabled}>
          {t("schedule")}
        </Button>
      </AuthorizedAction>
    </Grid>
  )
}
