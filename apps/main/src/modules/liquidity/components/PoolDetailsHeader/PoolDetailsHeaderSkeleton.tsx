import { Button, Flex, Icon } from "@galacticcouncil/ui/components"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AssetHeaderSkeleton } from "@/modules/layout/components/LayoutSkeleton/AssetHeaderSkeleton"

export const PoolDetailsHeaderSkeleton = () => {
  const { t } = useTranslation("liquidity")

  return (
    <Flex justify="space-between" pb="m">
      <AssetHeaderSkeleton />
      <Flex
        align="center"
        gap="m"
        sx={{
          position: ["fixed", "unset"],
          bottom: "4.5rem",
          zIndex: 2,
        }}
      >
        <Button disabled>
          <Icon size="s" component={Plus} />
          {t("addLiquidity")}
        </Button>
        <Button variant="secondary" disabled>
          <Icon size="s" component={Plus} />
          {t("details.header.swap")}
        </Button>
      </Flex>
    </Flex>
  )
}
