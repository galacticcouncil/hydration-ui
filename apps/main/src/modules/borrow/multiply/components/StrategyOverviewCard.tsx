import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import {
  Grid,
  Paper,
  Separator,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData } from "@/api/borrow"
import { STRATEGY_MAX_LEVERAGE } from "@/modules/borrow/multiply/config"
import { ReserveLabel } from "@/modules/borrow/reserve/components/ReserveLabel"

type StrategyOverviewCardProps = {
  reserve: ComputedReserveData
  debtReserve: ComputedReserveData
  apyData?: BorrowAssetApyData
}

export const StrategyOverviewCard: React.FC<StrategyOverviewCardProps> = ({
  reserve,
  debtReserve,
  apyData,
}) => {
  const { t } = useTranslation(["common", "borrow"])

  const liquidity =
    reserve.availableLiquidityUSD !== null &&
    reserve.availableLiquidityUSD !== undefined
      ? t("common:currency.compact", {
          value: Number(reserve.availableLiquidityUSD),
        })
      : "—"

  const netApy =
    apyData?.totalSupplyApy !== null && apyData?.totalSupplyApy !== undefined
      ? t("common:percent", { value: apyData.totalSupplyApy })
      : "—"

  const maxLtv =
    reserve.formattedBaseLTVasCollateral !== undefined
      ? t("common:percent", {
          value: Number(reserve.formattedBaseLTVasCollateral) * 100,
        })
      : "—"

  const liquidationLtv =
    reserve.formattedReserveLiquidationThreshold !== undefined
      ? t("common:percent", {
          value: Number(reserve.formattedReserveLiquidationThreshold) * 100,
        })
      : "—"

  return (
    <Paper p="xl">
      <Stack gap="l">
        <Text fs="p3" fw={500} font="primary">
          {t("borrow:multiply.detail.loopingOverview")}
        </Text>

        <Stack
          direction={["column", null, "row"]}
          gap={[10, null, 40, 60]}
          separated
        >
          <ValueStats
            label={t("borrow:multiply.detail.liquidityAvailable")}
            value={liquidity}
            size="large"
            wrap={[false, false, true]}
          />
          <ValueStats
            label={t("borrow:multiply.detail.maxNetApy")}
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
            size="large"
            wrap={[false, false, true]}
          />
          <ValueStats
            label={t("borrow:multiply.detail.maxLeverage")}
            value={`${STRATEGY_MAX_LEVERAGE}.0x`}
            size="large"
            wrap={[false, false, true]}
          />
        </Stack>

        <Separator />

        <Grid columns={[2, 2, 4]} gap="base" align="center">
          <Text fs="p4" color={getToken("text.medium")}>
            {t("borrow:multiply.detail.collateralAsset")}
          </Text>
          <ReserveLabel reserve={reserve} size="small" />
          <Text fs="p4" color={getToken("text.medium")}>
            {t("borrow:multiply.detail.maxLtv")}
          </Text>
          <Text fs="p3" fw={500}>
            {maxLtv}
          </Text>

          <Text fs="p4" color={getToken("text.medium")}>
            {t("borrow:multiply.detail.debtAsset")}
          </Text>
          <ReserveLabel reserve={debtReserve} size="small" />
          <Text fs="p4" color={getToken("text.medium")}>
            {t("borrow:multiply.detail.liquidationLtv")}
          </Text>
          <Text fs="p3" fw={500}>
            {liquidationLtv}
          </Text>

          <Text fs="p4" color={getToken("text.medium")}>
            {t("borrow:multiply.detail.avgLeverageTaken")}
          </Text>
          <Text fs="p3" fw={500}>
            —
          </Text>
        </Grid>
      </Stack>
    </Paper>
  )
}
