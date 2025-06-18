import {
  Button,
  Flex,
  Grid,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
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
    <Grid rowGap={getTokenPx("containers.paddings.tertiary")} py={20}>
      <AuthorizedAction size="large">
        <Button type="submit" size="large" disabled={!isEnabled}>
          {t("schedule")}
        </Button>
      </AuthorizedAction>
      <Flex gap={4} align="center" justify="center">
        <Text fs={12} lh={1} color={getToken("text.high")}>
          {t("trade:dca.footer.description")}
        </Text>
        <Tooltip text="TODO" />
      </Flex>
    </Grid>
  )
}
