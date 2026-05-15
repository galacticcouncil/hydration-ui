import { useFormattedHealthFactor } from "@galacticcouncil/money-market/hooks"
import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import {
  Amount,
  Box,
  Button,
  Flex,
  Paper,
  Separator,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useMemo, useState } from "react"
import { Trans, useTranslation } from "react-i18next"

import { useUserGigaBorrowSummary } from "@/api/borrow"
import { useGigaStakeExchangeRate } from "@/api/gigaStake"
import { AssetLogo } from "@/components/AssetLogo"
import { GigaHDXBorrowModal } from "@/modules/staking/gigaStaking/borrow/GigaHDXBorrowModal"
import { GigaHDXDocLink } from "@/modules/staking/gigaStaking/GigaHDXDocLink"
import {
  SChartContainer,
  SChartLegendContainer,
} from "@/modules/staking/gigaStaking/GigaStaking.styled"
import { GigaStakingChart } from "@/modules/staking/gigaStaking/GigaStakingChart"
import { GigaHDXRepayModal } from "@/modules/staking/gigaStaking/repay/GigaHDXRepayModal"
import { GigaHDXSupplyInfo } from "@/modules/staking/gigaStaking/supplyInfo/GigaHDXSupplyInfo"
import { useAssets } from "@/providers/assetsProvider"

const REWARDS_TO_CLAIM = 23444

export const GigaHDXPosition = () => {
  const { t } = useTranslation(["staking", "common", "borrow"])
  const [borrowModalOpen, setBorrowModalOpen] = useState(false)

  const { getAssetWithFallback, native } = useAssets()

  const [repayModalOpen, setRepayModalOpen] = useState(false)
  const ghdxMeta = getAssetWithFallback(HDX_ERC20_ASSET_ID)
  const { data: exchangeRate } = useGigaStakeExchangeRate()

  const { data: gigaBorrowSummary, isLoading } = useUserGigaBorrowSummary()
  const {
    borrowableHollar,
    maxBorrowableHollar,
    userSummary,
    hdxReserve,
    hollarReserve,
  } = gigaBorrowSummary ?? {}

  const debt = hollarReserve?.totalBorrows || "0"
  const totalBorrowCapacity = Big(debt).plus(borrowableHollar || "0")
  const usedBorrowingPower = totalBorrowCapacity.gt(0)
    ? Big(debt).div(totalBorrowCapacity).times(100).toNumber()
    : 0

  const { healthFactor, healthFactorColor } = useFormattedHealthFactor(
    userSummary?.healthFactor || "-1",
  )

  const gigaHdxBalanceHuman = hdxReserve?.underlyingBalance ?? "0"

  /** HOLLAR per 1 HDX at HF = 1 (single collateral / single debt Giga pool). */
  const liquidationPriceHollarPerHdx = useMemo(() => {
    if (!userSummary || !hdxReserve || !hollarReserve) return null

    const debtMrc = Big(
      hollarReserve.totalBorrowsMarketReferenceCurrency || "0",
    )
    if (debtMrc.lte(0)) return null

    const qtyCollateral = Big(gigaHdxBalanceHuman)
    if (qtyCollateral.lte(0)) return null

    const reserve = hdxReserve.reserve
    if (reserve.reserveLiquidationThreshold === "0") return null

    const lt =
      userSummary.isInEmode &&
      userSummary.userEmodeCategoryId === reserve.eModeCategoryId
        ? reserve.formattedEModeLiquidationThreshold
        : reserve.formattedReserveLiquidationThreshold

    const ltNum = Big(lt || "0")
    if (ltNum.lte(0)) return null

    const liqPxMrc = debtMrc.div(qtyCollateral.times(ltNum))

    const hollarMrc = Big(
      hollarReserve.reserve.formattedPriceInMarketReferenceCurrency || "0",
    )
    if (hollarMrc.lte(0)) return null

    return liqPxMrc.div(hollarMrc)
  }, [userSummary, hdxReserve, hollarReserve, gigaHdxBalanceHuman])

  const hasDebt = Big(debt).gt(0)

  return (
    <>
      <Paper>
        <Flex
          align="center"
          py={["l", "xl"]}
          px={["m", "xl"]}
          pb="l"
          gap="base"
        >
          <AssetLogo id={ghdxMeta.id} />

          <Flex direction="column" justify="space-between">
            <Text
              font="primary"
              fw={500}
              fs="base"
              lh={1}
              color={getToken("text.high")}
            >
              {t("gigaStaking.position.title")}
            </Text>
            <Text fs="p6" lh={1} color={getToken("text.medium")}>
              {t("gigaStaking.position.desc")}
            </Text>
          </Flex>

          <Amount
            value={
              <Text
                font="primary"
                fs={["base", "h6"]}
                lh={1}
                fw={500}
                color={getToken("text.tint.secondary")}
              >
                {t("common:currency", {
                  value: gigaHdxBalanceHuman,
                  symbol: ghdxMeta.symbol,
                })}
              </Text>
            }
            displayValue={t("gigaStaking.position.underlying.value", {
              value: Big(gigaHdxBalanceHuman)
                .times(exchangeRate?.toString() || "0")
                .toString(),
              symbol: native.symbol,
            })}
            sx={{ ml: "auto", textAlign: "right" }}
          />
        </Flex>

        {hasDebt && (
          <>
            <Separator />
            <Stack
              direction={["column", "column", "column", "row"]}
              gap={["xxl", null]}
              justify="start"
              py={["l", "l"]}
              px={["m", "xl"]}
              separated
            >
              <ValueStats
                size="small"
                label={t("borrow:healthFactor")}
                wrap={[false, true]}
                isLoading={isLoading}
                customValue={
                  <Text
                    font="primary"
                    fw={500}
                    fs="h7"
                    lh={1}
                    sx={{ color: healthFactorColor }}
                  >
                    {healthFactor !== "-1" ? healthFactor : "-"}
                  </Text>
                }
              />
              <ValueStats
                size="small"
                label="Liquidation price"
                wrap={[false, true]}
                isLoading={isLoading}
                value={
                  liquidationPriceHollarPerHdx
                    ? t("common:currency", {
                        value: liquidationPriceHollarPerHdx
                          .round(18, Big.roundHalfUp)
                          .toFixed(),
                        symbol: `${hollarReserve?.reserve.symbol ?? ""}/${ghdxMeta.symbol}`,
                      })
                    : "-"
                }
              />
            </Stack>
          </>
        )}
        <Separator />
        <Box
          m={["l", "xl"]}
          p={["m", "xl"]}
          minWidth="300px"
          bg={getToken("surfaces.containers.dim.dimOnBg")}
          borderRadius="xl"
          flex={1}
          asChild
        >
          <Flex direction="column" gap="l">
            <Flex justify="space-between" align="center">
              <Text
                font="primary"
                fw={500}
                fs="base"
                lh={1}
                color={getToken("text.high")}
              >
                {t("gigaStaking.position.borrows.title")}
              </Text>

              <Text fw={500} fs="p5" lh={1} color={getToken("text.medium")}>
                <Trans
                  t={t}
                  i18nKey="gigaStaking.position.borrow.apy"
                  values={{ value: 4.5 }}
                >
                  <Text as="span" color={getToken("text.high")} />
                </Trans>
              </Text>
            </Flex>

            <Separator />

            <Stack
              direction={["column", "column", "column", "column", "row"]}
              gap={["xl", null]}
              justify="space-between"
              separated
            >
              <Flex justify="space-between" align="center" gap="base" flex={1}>
                <Flex direction="column">
                  <Amount
                    label={
                      <Text fs="p6" lh={1} color={getToken("text.medium")}>
                        {t("borrow:debt")}
                      </Text>
                    }
                    value={
                      <Text
                        font="primary"
                        fs="base"
                        lh={1}
                        fw={500}
                        color={getToken("text.high")}
                      >
                        {t("common:currency", {
                          value: debt,
                          symbol: hollarReserve?.reserve.symbol,
                        })}
                      </Text>
                    }
                    displayValue={t("common:currency", {
                      value: hollarReserve?.totalBorrowsUSD || "0",
                    })}
                  />
                  <Text fs="p6" fw={400} color={getToken("text.high")}>
                    {t("gigaStaking.position.borrows.power", {
                      value: usedBorrowingPower,
                    })}
                  </Text>
                </Flex>

                <Button
                  variant="secondary"
                  disabled={!hasDebt}
                  onClick={() => setRepayModalOpen(true)}
                >
                  {t("common:repay")}
                </Button>
              </Flex>

              <Flex justify="space-between" align="center" gap="base" flex={1}>
                <Amount
                  label={
                    <Text fs="p6" lh={1} color={getToken("text.medium")}>
                      {t("gigaStaking.borrow.label")}
                    </Text>
                  }
                  value={
                    <Text
                      font="primary"
                      fs="base"
                      lh={1}
                      fw={500}
                      color={getToken("text.high")}
                    >
                      {t("common:currency", {
                        value: maxBorrowableHollar || "0",
                        symbol: hollarReserve?.reserve.symbol,
                      })}
                    </Text>
                  }
                  displayValue={t("common:currency", {
                    value: Big(maxBorrowableHollar || "0")
                      .times(hollarReserve?.reserve.priceInUSD || "0")
                      .toString(),
                  })}
                />
                <Button onClick={() => setBorrowModalOpen(true)}>
                  {t("common:borrow")}
                </Button>
              </Flex>
            </Stack>
          </Flex>
        </Box>

        <Box px={["l", "xl"]} pb={["m", "xl"]}>
          <SChartContainer sx={{ mt: "xxl" }}>
            <GigaStakingChart />

            <SChartLegendContainer asChild>
              <Flex direction="column" gap="l">
                <Flex justify="space-between" align="center">
                  <Amount
                    label={t("gigaStaking.claim.label")}
                    value={
                      <Text
                        font="primary"
                        fs="h5"
                        fw={500}
                        lh={1}
                        color={getToken("text.tint.primary")}
                      >
                        {t("common:currency", {
                          value: REWARDS_TO_CLAIM,
                          symbol: native.symbol,
                        })}
                      </Text>
                    }
                  />

                  <Button variant="secondary" size="large">
                    {t("gigaStaking.claim.cta")}
                  </Button>
                </Flex>

                <Separator />

                <Text fs="p2" lh="m" color={getToken("text.medium")}>
                  {t("staking:gigaStaking.rewards.desc")}
                </Text>
              </Flex>
            </SChartLegendContainer>
          </SChartContainer>
        </Box>

        <GigaHDXSupplyInfo />

        <GigaHDXDocLink />
      </Paper>

      <GigaHDXRepayModal
        open={repayModalOpen}
        onClose={() => setRepayModalOpen(false)}
      />

      <GigaHDXBorrowModal
        open={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
      />
    </>
  )
}
