import { Box, Flex, Text, Toggle } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const RpcAutoModeToggle: React.FC<
  React.ComponentPropsWithoutRef<typeof Toggle>
> = (props) => {
  const { t } = useTranslation("common")
  return (
    <Flex align="center" justify="space-between">
      <Box>
        <Text>{t("rpc.change.modal.autoMode.title")}</Text>
        <Text
          fs="p5"
          color={getToken("text.medium")}
          maxWidth={["100%", "75%"]}
        >
          {t("rpc.change.modal.autoMode.desc")}
        </Text>
      </Box>
      <Toggle size="large" {...props} />
    </Flex>
  )
}
