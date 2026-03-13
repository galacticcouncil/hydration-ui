import {
  Chip,
  Flex,
  Icon,
  LOGO_SIZES,
  Paper,
  Separator,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { MONEY_MARKET_STRATEGY_ASSETS } from "@galacticcouncil/utils"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { MultiplyPair } from "@/modules/borrow/multiply/hooks/useMultiplyPairs"
import { getMaxReservePairLeverage } from "@/modules/borrow/multiply/utils/leverage"
import { useAssets } from "@/providers/assetsProvider"

export const FeaturedPairCard: React.FC<MultiplyPair> = ({
  collateralReserve,
  debtReserve,
  apyData,
  config,
}) => {
  const { t } = useTranslation(["common", "borrow"])
  const { getRelatedAToken } = useAssets()

  const isStrategyAsset = MONEY_MARKET_STRATEGY_ASSETS.includes(
    config.collateralAssetId,
  )

  const aToken = getRelatedAToken(config.collateralAssetId)
  const logoId = isStrategyAsset
    ? aToken?.id || config.collateralAssetId
    : config.collateralAssetId

  const symbol = isStrategyAsset
    ? aToken?.symbol || collateralReserve.symbol
    : collateralReserve.symbol

  const displayName = config.name || symbol

  const baseSupplyApy = Number(collateralReserve.supplyAPY) * 100
  const supplyApy = apyData?.underlyingSupplyApy || baseSupplyApy

  const liquidity = collateralReserve.availableLiquidityUSD
    ? t("common:currency.compact", {
        value: Number(collateralReserve.availableLiquidityUSD),
      })
    : "—"

  const maxLeverage = getMaxReservePairLeverage(collateralReserve, debtReserve)

  return (
    <Paper p="xl" hoverable>
      <Stack gap="l">
        <Flex
          justify="space-between"
          align="flex-start"
          sx={{ aspectRatio: ["3 / 1", "2 / 1"] }}
        >
          {config?.icon ? (
            <Icon component={config.icon} size={LOGO_SIZES["extra-large"]} />
          ) : (
            <AssetLogo id={logoId} size="extra-large" />
          )}
          <Chip variant="green" size="small" rounded>
            {t("borrow:multiply.strategy.upTo", {
              multiplier: t("common:multiplier", { value: maxLeverage }),
            })}
          </Chip>
        </Flex>

        <Flex gap="xl">
          <ValueStats
            label={t("apy")}
            customValue={
              <Text
                fs="h5"
                lh={1}
                font="primary"
                fw={600}
                color={getToken("accents.success.emphasis")}
              >
                {t("common:percent", { value: supplyApy })}
              </Text>
            }
            size="medium"
            wrap
          />
          <ValueStats
            label={t("borrow:multiply.strategy.liquidityAvailable")}
            customValue={
              <Text fs="h5" lh={1} font="primary" fw={600}>
                {liquidity}
              </Text>
            }
            size="medium"
            wrap
          />
        </Flex>

        <Separator my="s" />

        <Stack gap="base">
          <Text fw={500} lh={1.1} fs="h6" font="primary">
            {displayName}
          </Text>
          <Text fs="p4" color={getToken("text.low")}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis
            dignissimos eum minus delectus exercitationem iure eaque ab, labore
            earum.
          </Text>
        </Stack>
      </Stack>
      <Link
        to="/borrow/multiply/$id"
        params={{ id: config.id }}
        sx={{ "&::before": { content: "''", position: "absolute", inset: 0 } }}
      />
    </Paper>
  )
}
