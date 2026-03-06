import { DashboardReserve } from "@galacticcouncil/money-market/utils"
import {
  Chip,
  Flex,
  Icon,
  LOGO_SIZES,
  Paper,
  Separator,
  Skeleton,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData } from "@/api/borrow"
import { AssetLogo } from "@/components/AssetLogo"
import { MULTIPLY_ASSETS_CONFIG } from "@/modules/borrow/multiply/config"
import { getMaxReserveLeverage } from "@/modules/borrow/multiply/utils/leverage"
import { useAssets } from "@/providers/assetsProvider"

type FeaturedStrategyCardProps =
  | {
      isLoading: true
      reserve?: undefined
      apyData?: undefined
    }
  | {
      isLoading?: false
      reserve: DashboardReserve
      apyData?: BorrowAssetApyData
    }

export const FeaturedStrategyCard: React.FC<FeaturedStrategyCardProps> = ({
  reserve,
  apyData,
  isLoading,
}) => {
  const { t } = useTranslation(["common", "borrow"])
  const { getRelatedAToken } = useAssets()

  if (isLoading) {
    return (
      <Paper p="xl">
        <Stack gap="l">
          <Flex justify="space-between" align="flex-start">
            <AssetLogo id="" size="large" isLoading />
            <Skeleton width={80} height={24} />
          </Flex>
          <Flex gap="xl">
            <Stack gap="xxs">
              <Skeleton width={60} height={12} />
              <Skeleton width={50} height={20} />
            </Stack>
            <Stack gap="xxs">
              <Skeleton width={100} height={12} />
              <Skeleton width={60} height={20} />
            </Stack>
          </Flex>
          <Stack gap="xxs">
            <Skeleton width={80} height={18} />
            <Skeleton height={48} />
          </Stack>
        </Stack>
      </Paper>
    )
  }
  const assetId = getAssetIdFromAddress(reserve.underlyingAsset)
  const aToken = getRelatedAToken(assetId)
  const logoId = aToken?.id || assetId

  const strategy = MULTIPLY_ASSETS_CONFIG.find(
    (s) => s.collateralAssetId === assetId,
  )!

  const displayName = strategy.name ?? reserve.symbol

  const baseSupplyApy = Number(reserve.supplyAPY) * 100
  const supplyApy = apyData?.underlyingSupplyApy || baseSupplyApy

  const liquidity = reserve.availableLiquidityUSD
    ? t("common:currency.compact", {
        value: Number(reserve.availableLiquidityUSD),
      })
    : "—"

  const maxLeverage = getMaxReserveLeverage(reserve)

  return (
    <Paper p="xl" position="relative">
      <Stack gap="l">
        <Flex
          justify="space-between"
          align="flex-start"
          sx={{ aspectRatio: ["3 / 1", "2 / 1"] }}
        >
          {strategy?.icon ? (
            <Icon component={strategy.icon} size={LOGO_SIZES["extra-large"]} />
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
        params={{ id: assetId }}
        sx={{ "&::before": { content: "''", position: "absolute", inset: 0 } }}
      />
    </Paper>
  )
}
