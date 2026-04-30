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
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useUserGigaBorrowSummary } from "@/api/borrow"
import { AssetLogo } from "@/components/AssetLogo"
import { GigaHDXBorrowModal } from "@/modules/staking/gigaStaking/borrow/GigaHDXBorrowModal"
import {
  SChartContainer,
  SChartLegendContainer,
} from "@/modules/staking/gigaStaking/GigaStaking.styled"
import { GigaStakingChart } from "@/modules/staking/gigaStaking/GigaStakingChart"
import { GigaHDXRepayModal } from "@/modules/staking/gigaStaking/repay/GigaHDXRepayModal"
import { useAssets } from "@/providers/assetsProvider"

export const GigaHDXPosition = () => {
  const { t } = useTranslation(["staking", "common", "borrow"])
  const [borrowModalOpen, setBorrowModalOpen] = useState(false)

  const { getAssetWithFallback } = useAssets()

  const [repayModalOpen, setRepayModalOpen] = useState(false)
  const ghdxMeta = getAssetWithFallback(HDX_ERC20_ASSET_ID)

  const { data: gigaBorrowSummary, isLoading } = useUserGigaBorrowSummary()
  const { borrowableHollar, userSummary, hdxReserve, hollarReserve } =
    gigaBorrowSummary ?? {}
  const totalBorrowCapacity = Big(hollarReserve?.totalBorrows || "0").plus(
    borrowableHollar || "0",
  )
  const usedBorrowingPower = totalBorrowCapacity.gt(0)
    ? Big(hollarReserve?.totalBorrows || "0")
        .div(totalBorrowCapacity)
        .times(100)
        .toNumber()
    : 0

  const { healthFactor, healthFactorColor } = useFormattedHealthFactor(
    userSummary?.healthFactor || "-1",
  )

  return (
    <>
      <Paper>
        <Flex align="center" p="xl" gap="base">
          <AssetLogo id={ghdxMeta.id} />

          <Text
            font="primary"
            fw={500}
            fs="h7"
            lh={1}
            color={getToken("text.high")}
          >
            {t("gigaStaking.position.title")}
          </Text>

          <Amount
            value={
              <Text
                font="primary"
                fs="h6"
                fw={500}
                color={getToken("text.tint.secondary")}
              >
                {t("common:currency", {
                  value: hdxReserve?.underlyingBalance || "0",
                  symbol: ghdxMeta.symbol,
                })}
              </Text>
            }
            displayValue={t("common:currency", {
              value: hdxReserve?.underlyingBalanceUSD || "0",
            })}
            sx={{ ml: "auto", textAlign: "right" }}
          />
        </Flex>
        <Separator />
        <Stack
          direction={["column", "column", "column", "row"]}
          gap={["base", null]}
          py="l"
          px="xl"
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
            label="Liqudation price"
            wrap={[false, true]}
            isLoading={isLoading}
            value={t("common:currency", {
              value: 0.00001,
              symbol: "HOLLAR/HDX",
            })}
          />
          <ValueStats
            size="small"
            label="Current borrow % APR"
            wrap={[false, true]}
            isLoading={isLoading}
            value={t("common:percent", { value: 10 })}
          />
        </Stack>
        <Separator />
        <Box p="xl">
          <Flex align="stretch" gap="base" justify="space-between" wrap>
            <PositionCard label={t("gigaStaking.position.supplies.title")}>
              <Amount
                value={
                  <Text
                    font="primary"
                    fs="h6"
                    fw={500}
                    lh={1}
                    color={getToken("text.tint.secondary")}
                  >
                    {t("common:currency", {
                      value: hdxReserve?.underlyingBalance || "0",
                      symbol: ghdxMeta.symbol,
                    })}
                  </Text>
                }
                displayValue={t("common:currency", {
                  value: hdxReserve?.underlyingBalanceUSD || "0",
                })}
              />
              <Separator />
              <Amount
                label={
                  <Text fs="p6" lh={1} color={getToken("text.medium")}>
                    {t("gigaStaking.position.supplies.underlying")}
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
                      value: hdxReserve?.underlyingBalance || "0",
                      symbol: ghdxMeta.symbol,
                    })}
                  </Text>
                }
                displayValue="1 GHDX = 1.0192 HDX" //@TODO: calculate it
                sx={{ gap: 0 }}
              />
            </PositionCard>
            <PositionCard
              label={t("gigaStaking.position.borrows.title")}
              headerValue={
                <Text fs="p6" lh={1} color={getToken("text.high")} fw={400}>
                  {t("gigaStaking.position.borrows.power", {
                    value: usedBorrowingPower,
                  })}
                </Text>
              }
            >
              <Flex justify="space-between" align="center">
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
                        value: hollarReserve?.totalBorrows || "0",
                        symbol: hollarReserve?.reserve.symbol,
                      })}
                    </Text>
                  }
                  displayValue={t("common:currency", {
                    value: hollarReserve?.totalBorrowsUSD || "0",
                  })}
                />
                <Button
                  variant="accent"
                  disabled={hollarReserve?.totalBorrows === "0"}
                  outline
                  onClick={() => setRepayModalOpen(true)}
                >
                  {t("common:repay")}
                </Button>
              </Flex>
              <Separator />
              <Flex justify="space-between" align="center">
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
                        value: borrowableHollar || "0",
                        symbol: hollarReserve?.reserve.symbol,
                      })}
                    </Text>
                  }
                  displayValue={t("common:currency", {
                    value: Big(borrowableHollar || "0")
                      .times(hollarReserve?.reserve.priceInUSD || "0")
                      .toString(),
                  })}
                />
                <Button onClick={() => setBorrowModalOpen(true)}>
                  {t("common:borrow")}
                </Button>
              </Flex>
            </PositionCard>
          </Flex>
        </Box>

        <Separator />

        <Box px="xl" pb="xl">
          <SChartContainer sx={{ mt: "xxl" }}>
            <GigaStakingChart />

            <SChartLegendContainer asChild>
              <Text fs="p2" lh="m" color={getToken("text.medium")}>
                {t("staking:gigaStaking.rewards.desc")}
              </Text>
            </SChartLegendContainer>
          </SChartContainer>
        </Box>
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

const PositionCard = ({
  label,
  headerValue,
  children,
}: {
  label: string
  headerValue?: React.ReactNode
  children: React.ReactNode
}) => {
  const Title = (
    <Text
      font="primary"
      fw={500}
      fs="base"
      lh={1}
      color={getToken("text.high")}
    >
      {label}
    </Text>
  )

  return (
    <Box
      p="xl"
      minWidth="300px"
      bg={getToken("surfaces.containers.dim.dimOnBg")}
      borderRadius="xl"
      flex={1}
      asChild
    >
      <Flex direction="column" gap="base">
        {headerValue ? (
          <Flex justify="space-between" align="center">
            {Title}
            {headerValue}
          </Flex>
        ) : (
          Title
        )}
        <Separator />

        <Flex direction="column" gap="base" justify="space-between">
          {children}
        </Flex>
      </Flex>
    </Box>
  )
}
