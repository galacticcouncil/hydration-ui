import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Flex,
  Separator,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull, useDisplayAssetPrice } from "@/components"
import { LiquidityFarms } from "@/modules/wallet/assets/MyLiquidity/LiquidityFarms"
import { LiquidityPositionActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionActions"
import { WalletLiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.columns"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
  readonly position: WalletLiquidityPosition
}

export const LiquidityPositionMobile: FC<Props> = ({ assetId, position }) => {
  const { t } = useTranslation()

  const { getAsset } = useAssets()
  const asset = getAsset(assetId)

  const [initialValueDisplayPrice] = useDisplayAssetPrice(
    assetId,
    position.initialValue,
  )

  const [currentValueDisplayPrice] = useDisplayAssetPrice(
    assetId,
    position.currentValue,
  )

  return (
    <Flex
      pt={getTokenPx("containers.paddings.secondary")}
      pb={getTokenPx("containers.paddings.primary")}
      borderRadius={getTokenPx("containers.cornerRadius.containersPrimary")}
      bg={getToken("controls.dim.base")}
      direction="column"
      gap={getTokenPx("containers.paddings.secondary")}
      borderWidth={1}
      borderStyle="solid"
      borderColor={getToken("details.borders")}
    >
      <Flex
        px={getTokenPx("containers.paddings.primary")}
        justify="space-between"
        align="center"
      >
        {asset && <AssetLabelFull asset={asset} withName={false} />}
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
      <Separator />
      <Flex px={getTokenPx("containers.paddings.primary")} gap={54}>
        <Amount
          label={t("initialValue")}
          value={t("number", {
            value: position.initialValue,
          })}
          displayValue={initialValueDisplayPrice}
        />
        <Amount
          label={t("currentValue")}
          value={t("number", {
            value: position.currentValue,
          })}
          displayValue={currentValueDisplayPrice}
        />
      </Flex>
    </Flex>
  )
}
