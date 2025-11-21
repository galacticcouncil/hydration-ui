import { Button, Grid, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"

type Props = {
  readonly isEnabled: boolean
}

export const DcaFooter: FC<Props> = ({ isEnabled }) => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <Grid
      py={20}
      rowGap={getTokenPx("containers.paddings.tertiary")}
      justifyItems="center"
    >
      <AuthorizedAction size="large" width="100%">
        <Button type="submit" size="large" width="100%" disabled={!isEnabled}>
          {t("schedule")}
        </Button>
      </AuthorizedAction>
      <Text fs="p5" lh={1.4} color={getToken("text.high")}>
        {t("trade:dca.footer.message")}
      </Text>
    </Grid>
  )
}
