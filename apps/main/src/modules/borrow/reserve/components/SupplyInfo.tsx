import {
  AssetCapHookData,
  ComputedReserveData,
} from "@galacticcouncil/money-market/hooks"
import { MarketDataType } from "@galacticcouncil/money-market/utils"
import { Check, CircleInfo } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Box,
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
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { CapProgressCircle } from "@/modules/borrow/reserve/components/CapProgressCircle"

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
        {showSupplyCapStatus && (
          <CapProgressCircle
            radius={[16, 56]}
            thickness={3}
            labelPosition={["end", "center"]}
            percent={supplyCap.percentUsed}
            tooltip={t("borrow:supply.cap.tooltip", {
              value: Big(reserve.supplyCap).minus(reserve.totalLiquidity),
              tokenSymbol: reserve.symbol,
              usdValue: Big(reserve.supplyCapUSD).minus(
                reserve.totalLiquidityUSD,
              ),
            })}
          />
        )}
        <Stack
          gap={[10, 40]}
          direction={["column", "row"]}
          justify="start"
          separated
          width="100%"
        >
          {showSupplyCapStatus ? (
            <ValueStats
              size="small"
              font="secondary"
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
              font="secondary"
              label={t("borrow:totalSupplied")}
              value={t("number.compact", {
                value: reserve.totalLiquidity,
              })}
              bottomLabel={t("currency.compact", {
                value: reserve.totalLiquidityUSD,
              })}
            />
          )}
          <ValueStats
            size="small"
            font="secondary"
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
                fw={600}
                color={getToken("accents.success.emphasis")}
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
                font="secondary"
                wrap
                label={t("borrow:maxLTV")}
                //tooltip={t("borrow:tooltip.maxLTV")}
                value={t("percent", {
                  value: Number(reserve.formattedBaseLTVasCollateral) * 100,
                })}
              />

              <ValueStats
                size="small"
                font="secondary"
                wrap
                label={t("borrow:risk.liquidationThreshold")}
                //tooltip={t("borrow:tooltip.liquidationThreshold")}
                value={t("percent", {
                  value:
                    Number(reserve.formattedReserveLiquidationThreshold) * 100,
                })}
              />
              <ValueStats
                size="small"
                font="secondary"
                wrap
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
