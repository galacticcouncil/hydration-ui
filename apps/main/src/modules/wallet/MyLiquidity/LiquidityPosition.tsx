import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  AmountMedium,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Text,
} from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { LiquidityFarms } from "@/modules/wallet/MyLiquidity/LiquidityFarms"
import { LiquidityPositionActions } from "@/modules/wallet/MyLiquidity/LiquidityPositionActions"
import { WalletLiquidityPosition } from "@/modules/wallet/MyLiquidity/MyLiquidityTable.columns"

type Props = {
  readonly assetId: string
  readonly number: number
  readonly position: WalletLiquidityPosition
}

export const LiquidityPosition: FC<Props> = ({ assetId, number, position }) => {
  const { t } = useTranslation()

  const [initialDisplayPrice] = useDisplayAssetPrice(
    assetId,
    position.initialValue,
  )
  const [currentDisplayPrice] = useDisplayAssetPrice(
    assetId,
    position.currentValue,
  )

  return (
    <Flex
      py={12}
      px={20}
      gap={16}
      borderRadius={16}
      bg="#4D525F10"
      justify="space-between"
      align="center"
      sx={{
        border: `1px solid #212837`,
      }}
    >
      <Text fs="p4" fw={500} color={getToken("text.high")}>
        #{number} {position.name}
      </Text>
      <AmountMedium
        label={t("initialValue")}
        value={position.initialValue}
        displayValue={initialDisplayPrice}
      />
      <AmountMedium
        label={t("currentValue")}
        value={position.currentValue}
        displayValue={currentDisplayPrice}
      />
      <LiquidityFarms assetId={assetId} rewards={position.rewards} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="tertiary" outline iconEnd={ChevronDown}>
            {t("actions")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <LiquidityPositionActions />
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  )
}
