import {
  ComputedUserReserveData,
  useFormattedHealthFactor,
} from "@galacticcouncil/money-market/hooks"
import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import {
  Amount,
  Box,
  Button,
  Flex,
  Paper,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { GigaBorrowableHollar } from "@/api/borrow"
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
  const { t } = useTranslation(["staking", "common"])
  const { native, getAssetWithFallback } = useAssets()

  const [repayModalOpen, setRepayModalOpen] = useState(false)
  const ghdxMeta = getAssetWithFallback(HDX_ERC20_ASSET_ID)

  const { data: gigaBorrowSummary } = useUserGigaBorrowSummary()
  const { borrowableHollar, userSummary, hdxReserve, hollarReserve } =
    gigaBorrowSummary ?? {}

  const { healthFactor, healthFactorColor } = useFormattedHealthFactor(
    userSummary?.healthFactor || "-1",
  )

  return (
    <>
      <Paper>
        <Flex align="center" p="xl" gap="base">
          <AssetLogo id={native.id} />

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
        <Box p="xl">
          <Flex align="center" gap="base" justify="space-between" wrap>
            <PositionCard
              label={t("staking:gigaStaking.borrowed.label")}
              body={
                <>
                  <Amount
                    value={
                      <Text
                        font="primary"
                        fs="base"
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
                    outline
                    onClick={() => setRepayModalOpen(true)}
                  >
                    {t("common:repay")}
                  </Button>
                </>
              }
            />
            {borrowableHollar && hollarReserve && (
              <AvailableToBorrowCard
                borrowableHollar={borrowableHollar}
                hollarReserve={hollarReserve}
              />
            )}
          </Flex>
        </Box>

        {healthFactor !== "-1" && (
          <Box px="xl" pb="xl">
            <Flex justify="space-between" align="center">
              <Text
                fs="p2"
                fw={500}
                color={getToken("text.high")}
                font="primary"
              >
                {t("staking:gigaStaking.hf.label")}
              </Text>
              <Text
                font="primary"
                fw={500}
                fs="h7"
                lh={1.5}
                sx={{ color: healthFactorColor }}
              >
                {healthFactor}
              </Text>
            </Flex>
          </Box>
        )}
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
    </>
  )
}

const AvailableToBorrowCard = ({
  borrowableHollar,
  hollarReserve,
}: {
  borrowableHollar: GigaBorrowableHollar
  hollarReserve: ComputedUserReserveData
}) => {
  const { t } = useTranslation(["common", "staking"])
  const [borrowModalOpen, setBorrowModalOpen] = useState(false)

  return (
    <>
      <PositionCard
        label={t("staking:gigaStaking.borrow.label")}
        body={
          <>
            <Amount
              value={
                <Text
                  font="primary"
                  fs="base"
                  fw={500}
                  color={getToken("text.high")}
                >
                  {t("currency", {
                    value: borrowableHollar.borrowableHollar,
                    symbol: hollarReserve?.reserve.symbol,
                  })}
                </Text>
              }
              displayValue={t("currency", {
                value: Big(borrowableHollar.borrowableHollar)
                  .times(hollarReserve.reserve.priceInUSD)
                  .toString(),
              })}
            />
            <Button onClick={() => setBorrowModalOpen(true)}>
              {t("borrow")}
            </Button>
          </>
        }
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
  body,
}: {
  label: string
  body: React.ReactNode
}) => {
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
        <Text
          font="primary"
          fw={500}
          fs="base"
          lh={1}
          color={getToken("text.high")}
        >
          {label}
        </Text>
        <Separator />

        <Flex justify="space-between">{body}</Flex>
      </Flex>
    </Box>
  )
}
