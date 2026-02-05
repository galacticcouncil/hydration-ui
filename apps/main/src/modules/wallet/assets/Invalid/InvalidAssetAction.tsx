import { Box, Button } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const InvalidAssetAction: FC = () => {
  const { t } = useTranslation("wallet")

  return (
    <Box py="xl">
      <Button size="large" sx={{ width: "100%" }}>
        {t("invalidAsset.cta")}
      </Button>
    </Box>
  )
}
