import { Button, Grid, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"

type Props = {
  readonly isEnabled: boolean
  readonly isOpenBudget: boolean
}

export const DcaFooter: FC<Props> = ({ isEnabled, isOpenBudget }) => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <Grid py="xl" rowGap="m" justifyItems="center">
      <AuthorizedAction size="large" width="100%">
        <Button type="submit" size="large" width="100%" disabled={!isEnabled}>
          {t("schedule")}
        </Button>
      </AuthorizedAction>
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
