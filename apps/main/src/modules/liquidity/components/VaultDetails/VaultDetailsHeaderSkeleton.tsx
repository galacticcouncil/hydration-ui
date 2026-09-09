import { Button, Flex } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

import { AssetHeaderSkeleton } from "@/modules/layout/components/LayoutSkeleton/AssetHeaderSkeleton"
import { SPoolDetailsActionsContainer } from "@/modules/liquidity/components/PoolDetailsHeader/PoolDetailsHeader.styled"

export const VaultDetailsHeaderSkeleton = () => {
  const { t } = useTranslation("liquidity")
  const { isMobile } = useBreakpoints()

  return (
    <Flex justify="space-between" pb="m">
      <AssetHeaderSkeleton />

      <SPoolDetailsActionsContainer align="center" gap="m">
        <Button size={isMobile ? "medium" : "small"} width="100%" disabled>
          {t("vaults.action.deposit")}
        </Button>
      </SPoolDetailsActionsContainer>
    </Flex>
  )
}
