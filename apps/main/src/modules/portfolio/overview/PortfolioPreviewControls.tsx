import { Box, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { usePortfolioPreview } from "@/modules/portfolio/overview/usePortfolioPreview"

export const PortfolioPreviewControls = () => {
  const { t } = useTranslation("wallet")
  const { isPreview, isLocal, toggle } = usePortfolioPreview()
  if (!isLocal) return null

  return (
    <Box p="m">
      <Flex align="center" justify="space-between" gap="base" wrap>
        <Text fs="p6">
          {t(
            isPreview
              ? "myStrategies.preview.description"
              : "myStrategies.preview.available",
          )}
        </Text>
        <Button size="small" variant="secondary" onClick={toggle}>
          {t(
            isPreview
              ? "myStrategies.preview.live"
              : "myStrategies.preview.samples",
          )}
        </Button>
      </Flex>
    </Box>
  )
}
