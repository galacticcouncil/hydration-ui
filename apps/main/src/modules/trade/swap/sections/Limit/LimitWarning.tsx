import { Alert, ExternalLink, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const LimitWarning: FC = () => {
  const { t } = useTranslation(["trade", "common"])

  return (
    <Alert
      variant="info"
      description={
        <Text fs="p5" lh="m" color={getToken("text.high")}>
          {t("limit.warning.message")}{" "}
          {/* TODO: wire the More Info link to docs once the URL is
                finalized. */}
          <ExternalLink
            href="#"
            sx={{ color: getToken("text.tint.secondary") }}
          >
            {t("common:moreInfo")}
          </ExternalLink>
        </Text>
      }
    />
  )
}
