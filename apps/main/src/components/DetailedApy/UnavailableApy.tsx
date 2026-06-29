import { TriangleAlert } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { APY_NOT_AVAILABLE } from "@/utils/formatApyPercent"

export const UnavailableApy = () => {
  const { t } = useTranslation("common")

  return (
    <Flex gap="s" align="center">
      {APY_NOT_AVAILABLE}
      <Tooltip text={t("externalApy.alert")} asChild>
        <Icon
          as="button"
          component={TriangleAlert}
          color={getToken("accents.alertAlt.primary")}
          sx={{ height: "1em", width: "1em" }}
        />
      </Tooltip>
    </Flex>
  )
}
