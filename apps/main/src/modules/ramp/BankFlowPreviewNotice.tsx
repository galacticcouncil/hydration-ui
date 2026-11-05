import { InfoIcon } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const BankFlowPreviewNotice: FC = () => {
  const { t } = useTranslation("onramp")
  return (
    <Flex gap="s" align="center" justify="center">
      <Icon component={InfoIcon} size="s" color={getToken("text.medium")} />
      <Text fs="p6" color={getToken("text.medium")}>
        {t("bankV2.preview")}
      </Text>
    </Flex>
  )
}
