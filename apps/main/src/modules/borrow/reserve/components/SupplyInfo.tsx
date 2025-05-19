import {
  AssetCapHookData,
  ComputedReserveData,
} from "@galacticcouncil/money-market/hooks"
import { MarketDataType } from "@galacticcouncil/money-market/utils"
import { Check } from "@galacticcouncil/ui/assets/icons"
import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Box,
  CircularProgress,
  Flex,
  Icon,
  ProgressBar,
  Stack,
  Text,
  Tooltip,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { ThemeProps, useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

type SupplyInfoProps = {
  reserve: ComputedReserveData
  currentMarketData: MarketDataType
  showSupplyCapStatus: boolean
  supplyCap: AssetCapHookData
  debtCeiling: AssetCapHookData
}

export const SupplyInfo = ({
  reserve,
  showSupplyCapStatus,
  supplyCap,
  debtCeiling,
}: SupplyInfoProps) => {
  const { themeProps } = useTheme()
  const { t } = useTranslation(["common", "borrow"])

  return (
    <>
      <Flex
        direction={["column", "row"]}
        gap={[20, 40]}
        mb={20}
        align={["start", "center"]}
      >
        <Box
          display={["none", "block"]}
          color={getToken("colors.successGreen.400")}
        >
          <CircularProgress
            radius={45}
            thickness={3}
            percent={
              supplyCap.percentUsed <= 2
                ? 2
                : supplyCap.percentUsed > 100
                  ? 100
                  : supplyCap.percentUsed
            }
          />
        </Box>
        <Stack gap={40} direction="row" separated>
          {showSupplyCapStatus ? (
            <ValueStats
              size="small"
              alwaysWrap
              label={t("borrow:totalSupplied")}
              value={t("borrow:cap.range", {
                valueA: reserve.totalLiquidity,
                valueB: reserve.supplyCap,
              })}
              bottomLabel={t("borrow:cap.range.usd", {
                valueA: reserve.totalLiquidityUSD,
                valueB: reserve.supplyCapUSD,
              })}
            />
          ) : (
            <ValueStats
              size="small"
              alwaysWrap
              label={t("borrow:totalSupplied")}
              customValue={
                <>
                  {t("number", {
                    value: Number(reserve.totalLiquidity),
                  })}
                  <Text fs={12} color="basic500" align={["right", "left"]}>
                    {Number(reserve.totalLiquidityUSD)}
                  </Text>
                </>
              }
            ></ValueStats>
          )}
          <ValueStats
            size="small"
            alwaysWrap
            label={t("apy")}
            value={t("percent", {
              value: Number(reserve.supplyAPY) * 100,
            })}
          />
        </Stack>
      </Flex>

      <Stack gap={14}>
        <Box>
          {reserve.isIsolated ? (
            <Box>
              <Text fs={14} mb={10} fw={500} transform="uppercase">
                {t("borrow:collateralUsage")}
              </Text>
              <Alert
                variant="warning"
                title={t("borrow:supply.isolatedCollateral.title")}
                description={t("borrow:supply.isolatedCollateral.description")}
              />
            </Box>
          ) : reserve.reserveLiquidationThreshold !== "0" ? (
            <Flex justify="space-between" align="center">
              <Text fs={14} mb={10} fw={500} transform="uppercase">
                {t("borrow:collateralUsage")}
              </Text>
              <Text
                fs={14}
                color={getToken("accents.success.primary")}
                display="flex"
                sx={{ alignItems: "center", gap: 4 }}
              >
                <Icon component={Check} size={16} />
                <Text as="span">{t("borrow:canBeCollateral")}</Text>
              </Text>
            </Flex>
          ) : (
            <Box>
              <Text fs={14} mb={10} fw={500} transform="uppercase">
                {t("borrow:collateralUsage")}
              </Text>
              <Alert
                variant="warning"
                description={t("borrow:supply.assetCannotBeCollateral")}
              />
            </Box>
          )}
        </Box>

        {reserve.reserveLiquidationThreshold !== "0" && (
          <>
            <Stack direction="row" gap={40}>
              <ValueStats
                size="small"
                alwaysWrap
                font="secondary"
                label={t("borrow:maxLTV")}
                //tooltip={t("borrow:tooltip.maxLTV")}
                value={t("percent", {
                  value: Number(reserve.formattedBaseLTVasCollateral) * 100,
                })}
              />

              <ValueStats
                size="small"
                alwaysWrap
                font="secondary"
                label={t("borrow:risk.liquidationThreshold")}
                //tooltip={t("borrow:tooltip.liquidationThreshold")}
                value={t("percent", {
                  value:
                    Number(reserve.formattedReserveLiquidationThreshold) * 100,
                })}
              />
              <ValueStats
                size="small"
                alwaysWrap
                font="secondary"
                label={t("borrow:risk.liquidationPenalty")}
                //tooltip={t("borrow:tooltip.liquidationPenalty")}
                value={t("percent", {
                  value: Number(reserve.formattedReserveLiquidationBonus) * 100,
                })}
              />
            </Stack>
            {reserve.isIsolated && (
              <Box>
                <Flex justify="space-between" align="center">
                  <Flex align="center">
                    <Text fs={13} color={getToken("text.medium")}>
                      Isolated Debt Ceiling
                    </Text>
                    <Tooltip text={t("borrow:tooltip.debtCeilingLimits")}>
                      <CircleInfo />
                    </Tooltip>
                  </Flex>
                  <Text fs={14}>
                    {t("currency", {
                      value: Number(reserve.isolationModeTotalDebtUSD),
                    })}
                    <Text as="span" display="inline-block" mx={4}>
                      of
                    </Text>
                    {t("currency", {
                      value: Number(reserve.debtCeilingUSD),
                    })}
                  </Text>
                </Flex>
                <ProgressBar
                  size="small"
                  color={determineDebtCeilingColor(themeProps, debtCeiling)}
                  value={
                    debtCeiling.percentUsed <= 1 ? 1 : debtCeiling.percentUsed
                  }
                />
              </Box>
            )}
          </>
        )}
      </Stack>
    </>
  )
}

const determineDebtCeilingColor = (
  theme: ThemeProps,
  debtCeiling: AssetCapHookData,
) => {
  if (debtCeiling.isMaxed || debtCeiling.percentUsed >= 99.99) {
    return theme.accents.danger.emphasis
  } else if (debtCeiling.percentUsed >= 98) {
    return theme.accents.alert.primary
  } else {
    return theme.accents.success.emphasis
  }
}
