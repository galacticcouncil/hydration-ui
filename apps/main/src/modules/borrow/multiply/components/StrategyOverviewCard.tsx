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
import { getMaxLeverage } from "@/modules/borrow/multiply/utils/leverage"
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

  const liquidity = reserve.availableLiquidityUSD
    ? t("common:currency.compact", {
        value: reserve.availableLiquidityUSD,
      })
    : ""

  const netApy = apyData?.totalSupplyApy
    ? t("common:percent", { value: apyData.totalSupplyApy })
    : ""

  const maxLtvValue =
    reserve.eModeCategoryId > 0
      ? reserve.formattedEModeLtv
      : reserve.formattedBaseLTVasCollateral

  const maxLtv = maxLtvValue
    ? t("common:percent", {
        value: Number(maxLtvValue) * 100,
      })
    : ""

  const liquidationLtvValue =
    reserve.eModeCategoryId > 0
      ? reserve.formattedEModeLiquidationThreshold
      : reserve.formattedReserveLiquidationThreshold

  const liquidationLtv = liquidationLtvValue
    ? t("common:percent", {
        value: Number(liquidationLtvValue) * 100,
      })
    : ""

  const maxLeverage = getMaxLeverage(Number(maxLtvValue))

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
            value={maxLeverage.toString() + "x"}
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
        </Grid>
      </Stack>
    </Paper>
  )
}
