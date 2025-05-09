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

export const DCAFooter: FC = () => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <Grid
      rowGap={getTokenPx("containers.paddings.tertiary")}
      justifyItems="center"
      py={20}
    >
      <Button type="submit" sx={{ justifySelf: "stretch" }} size="large">
        {t("schedule")}
      </Button>
      <Flex gap={4} align="center">
        <Text fs={12} lh={1} color={getToken("text.high")}>
          {t("trade:dca.footer.description")}
        </Text>
        <Tooltip text="TODO" />
      </Flex>
    </Grid>
  )
}
