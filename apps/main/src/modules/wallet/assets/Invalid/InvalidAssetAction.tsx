import { Button, Flex } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const InvalidAssetAction = () => {
  const { t } = useTranslation("wallet")

  return (
    <Flex py={20}>
      <Button size="large" sx={{ width: "100%" }}>
        {t("invalidAsset.cta")}
      </Button>
    </Flex>
  )
}
