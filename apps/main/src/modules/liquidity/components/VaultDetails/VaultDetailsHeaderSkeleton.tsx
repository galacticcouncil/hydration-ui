import { Button, Flex } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

import { FixedActionsBar } from "@/components/FixedActionsBar"
import { AssetHeaderSkeleton } from "@/modules/layout/components/LayoutSkeleton/AssetHeaderSkeleton"

export const VaultDetailsHeaderSkeleton = () => {
  const { t } = useTranslation("liquidity")
  const { isMobile } = useBreakpoints()

  return (
    <Flex justify="space-between" pb="m">
      <AssetHeaderSkeleton />

      <FixedActionsBar align="center" gap="m">
        <Button size={isMobile ? "medium" : "small"} width="100%" disabled>
          {t("vaults.action.deposit")}
        </Button>
      </FixedActionsBar>
    </Flex>
  )
}
