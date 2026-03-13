import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import {
  Box,
  Flex,
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
import {
  getMaxReserveLeverage,
  getMaxReserveLtv,
} from "@/modules/borrow/multiply/utils/leverage"
import { ReserveLabel } from "@/modules/borrow/reserve/components/ReserveLabel"

type StrategyOverviewCardProps = {
  collateralReserve: ComputedReserveData
  debtReserve: ComputedReserveData
  apyData?: BorrowAssetApyData
}

export const StrategyOverviewCard: React.FC<StrategyOverviewCardProps> = ({
  collateralReserve,
  debtReserve,
  apyData,
}) => {
  const { t } = useTranslation(["common", "borrow"])

  const liquidity = collateralReserve.availableLiquidityUSD
    ? t("common:currency.compact", {
        value: collateralReserve.availableLiquidityUSD,
      })
    : ""

  const baseSupplyApy = Number(collateralReserve.supplyAPY) * 100
  const supplyApy = apyData?.underlyingSupplyApy || baseSupplyApy

  const maxReserveLtv = getMaxReserveLtv(collateralReserve)
  const maxLeverage = getMaxReserveLeverage(collateralReserve)

  const maxLtv = t("common:percent", {
    value: Number(maxReserveLtv) * 100,
  })

  const liquidationLtvValue =
    collateralReserve.eModeCategoryId > 0
      ? collateralReserve.formattedEModeLiquidationThreshold
      : collateralReserve.formattedReserveLiquidationThreshold

  const liquidationLtv = liquidationLtvValue
    ? t("common:percent", {
        value: Number(liquidationLtvValue) * 100,
      })
    : ""

  return (
    <Paper p="xl">
      <Stack gap="l">
        <Text fs="p3" fw={500} font="primary">
          {t("borrow:multiply.detail.loopingOverview")}
        </Text>

        <Stack
          maxWidth={["100%", null, null, "70%"]}
          direction={["column", null, null, "row"]}
          gap={["l", null, null, "xxl"]}
          separated
        >
          <ValueStats
            label={t("borrow:multiply.detail.liquidityAvailable")}
            wrap={[false, false, false, true]}
            customValue={
              <Text
                fs={["h7", null, null, "h5"]}
                lh={1}
                font="primary"
                fw={500}
              >
                {liquidity}
              </Text>
            }
          />
          <ValueStats
            label={t("apy")}
            customValue={
              <Text
                fs={["h7", null, null, "h5"]}
                lh={1}
                font="primary"
                fw={500}
                color={getToken("accents.success.emphasis")}
              >
                {t("common:percent", { value: supplyApy })}
              </Text>
            }
            wrap={[false, false, false, true]}
          />
          <ValueStats
            label={t("borrow:multiply.detail.maxLeverage")}
            wrap={[false, false, false, true]}
            customValue={
              <Text
                fs={["h7", null, null, "h5"]}
                lh={1}
                font="primary"
                fw={500}
              >
                {t("common:multiplier", { value: maxLeverage })}
              </Text>
            }
          />
        </Stack>

        <Separator />

        <Grid
          columns={[1, 1, 1, 2]}
          gap={["base", null, null, "xxl"]}
          alignItems="center"
          justifyItems="space-between"
        >
          <Stack gap="m" separated withTrailingSeparator>
            <Flex justify="space-between" align="center">
              <Text fs="p4" color={getToken("text.medium")}>
                {t("borrow:multiply.detail.collateralAsset")}
              </Text>
              <Box>
                <ReserveLabel reserve={collateralReserve} size="small" />
              </Box>
            </Flex>
            <Flex justify="space-between" align="center">
              <Text fs="p4" color={getToken("text.medium")}>
                {t("borrow:multiply.detail.debtAsset")}
              </Text>
              <Box>
                <ReserveLabel reserve={debtReserve} size="small" />
              </Box>
            </Flex>
          </Stack>

          <Stack gap="m" separated withTrailingSeparator>
            <Flex justify="space-between" align="center">
              <Text fs="p4" color={getToken("text.medium")}>
                {t("borrow:multiply.detail.maxLtv")}
              </Text>
              <Text fs="p3" fw={500}>
                {maxLtv}
              </Text>
            </Flex>

            <Flex justify="space-between" align="center">
              <Text fs="p4" color={getToken("text.medium")}>
                {t("borrow:multiply.detail.liquidationLtv")}
              </Text>
              <Text fs="p3" fw={500}>
                {liquidationLtv}
              </Text>
            </Flex>
          </Stack>
        </Grid>
      </Stack>
    </Paper>
  )
}
