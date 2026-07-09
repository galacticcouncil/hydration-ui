import { Box, Flex, LinkTextButton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { GIGA_STAKING_DOCS_LINK } from "@/config/links"

export const GigaHDXDocLink = () => {
  const { t } = useTranslation("staking")
  return (
    <Box px="xl" pb="xl" asChild>
      <Flex gap="s">
        <Text fs="p5" color={getToken("text.medium")}>
          {t("gigaStaking.docLink.title")}
        </Text>

        <LinkTextButton
          href={GIGA_STAKING_DOCS_LINK}
          variant="underline"
          direction="external"
        >
          {t("gigaStaking.docLink.cta")}
        </LinkTextButton>
      </Flex>
    </Box>
  )
}
