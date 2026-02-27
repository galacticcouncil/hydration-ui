import { DashboardReserve } from "@galacticcouncil/money-market/utils"
import {
  Chip,
  Flex,
  Paper,
  Skeleton,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  GDOT_ASSET_ID,
  GDOT_ERC20_ID,
  getAssetIdFromAddress,
  GETH_ASSET_ID,
  GETH_ERC20_ID,
} from "@galacticcouncil/utils"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData } from "@/api/borrow"
import { AssetLogo } from "@/components/AssetLogo"

const RESERVE_LOGO_OVERRIDE_MAP: Record<string, string> = {
  [GDOT_ASSET_ID]: GDOT_ERC20_ID,
  [GETH_ASSET_ID]: GETH_ERC20_ID,
}

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
  const logoId = RESERVE_LOGO_OVERRIDE_MAP[assetId] ?? assetId

  const netApy =
    apyData?.totalSupplyApy !== null && apyData?.totalSupplyApy !== undefined
      ? t("common:percent", { value: apyData.totalSupplyApy })
      : "—"

  const liquidity =
    reserve.availableLiquidityUSD !== null &&
    reserve.availableLiquidityUSD !== undefined
      ? t("common:currency.compact", {
          value: Number(reserve.availableLiquidityUSD),
        })
      : "—"

  return (
    <Paper p="xl" position="relative">
      <Stack gap="l">
        <Flex
          justify="space-between"
          align="flex-start"
          sx={{ aspectRatio: ["3 / 1", "2 / 1"] }}
        >
          <AssetLogo id={logoId} size="extra-large" />
          <Chip variant="green" size="small" rounded>
            {t("borrow:multiply.strategy.upTo", { multiplier: "4X" })}
          </Chip>
        </Flex>

        <Flex gap="xl">
          <ValueStats
            label={t("borrow:multiply.strategy.netApy")}
            customValue={
              <Text
                fs="h5"
                lh={1}
                font="primary"
                fw={500}
                color={getToken("accents.success.emphasis")}
              >
                {netApy}
              </Text>
            }
            size="medium"
            wrap
          />
          <ValueStats
            label={t("borrow:multiply.strategy.liquidityAvailable")}
            customValue={
              <Text fs="h5" lh={1} font="primary" fw={500}>
                {liquidity}
              </Text>
            }
            size="medium"
            wrap
          />
        </Flex>

        <Stack gap="base">
          <Text fw={500} lh={1.1} fs="h6" font="primary">
            {reserve.symbol}
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
