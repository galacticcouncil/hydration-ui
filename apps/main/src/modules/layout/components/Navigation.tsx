import { Flex, FlexProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { NAVIGATION } from "@/config/navigation"

export const Navigation: React.FC<FlexProps> = (props) => {
  const { t } = useTranslation(["common"])
  return (
    <Flex {...props}>
      {NAVIGATION.map(({ key, href, order }) => (
        <Text
          key={key}
          py={8}
          px={10}
          color={getToken("text.medium")}
          decoration="none"
          asChild
          sx={{ order }}
        >
          <Link href={href}>{t(`common:navigation.${key}`)}</Link>
        </Text>
      ))}
    </Flex>
  )
}
