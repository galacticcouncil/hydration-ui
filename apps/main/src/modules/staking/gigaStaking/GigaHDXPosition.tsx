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
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo, useState } from "react"
import { Trans, useTranslation } from "react-i18next"

import { useUserGigaBorrowSummary } from "@/api/borrow"
import {
  claimableVotingRewardsQuery,
  gigaAccountStakesQuery,
  useGigaStakeExchangeRate,
} from "@/api/gigaStake"
import { spotPriceQuery } from "@/api/spotPrice"
import { AssetLogo } from "@/components/AssetLogo"
import { GigaHDXBorrowModal } from "@/modules/staking/gigaStaking/borrow/GigaHDXBorrowModal"
import { GigaHDXDocLink } from "@/modules/staking/gigaStaking/GigaHDXDocLink"
import { useClaimAndCompound } from "@/modules/staking/gigaStaking/GigaHDXPosition.utils"
import {
  SChartContainer,
  SChartLegendContainer,
} from "@/modules/staking/gigaStaking/GigaStaking.styled"
import { GigaHDXRepayModal } from "@/modules/staking/gigaStaking/repay/GigaHDXRepayModal"
import { GigaHDXSupplyInfo } from "@/modules/staking/gigaStaking/supplyInfo/GigaHDXSupplyInfo"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const GigaHDXPosition = () => {
  const { t } = useTranslation(["staking", "common", "borrow"])
  const [borrowModalOpen, setBorrowModalOpen] = useState(false)
  const { isMobile, isTablet } = useBreakpoints()

  const { getAssetWithFallback, native } = useAssets()
  const { account } = useAccount()
  const rpc = useRpcProvider()

  const [repayModalOpen, setRepayModalOpen] = useState(false)
  const ghdxMeta = getAssetWithFallback(HDX_ERC20_ASSET_ID)
  const { data: exchangeRate } = useGigaStakeExchangeRate()
  const { data: accountStake } = useQuery(
    gigaAccountStakesQuery(rpc, account?.address ?? ""),
  )
  const { data: claimableRewards } = useQuery(
    claimableVotingRewardsQuery(rpc, account?.address ?? ""),
  )
  const claimMutation = useClaimAndCompound()

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

  const gigaHdxBalanceUsd = hdxReserve?.underlyingBalanceUSD ?? "0"
  const stakedHdxHuman = Big(gigaHdxBalanceHuman)
    .times(exchangeRate?.toString() || "0")
    .toString()

  const principalHdxHuman = accountStake
    ? scaleHuman(accountStake.hdx, native.decimals)
    : "0"
  const accruedHdxBig = Big(stakedHdxHuman).minus(principalHdxHuman)
  // const accruedHdxHuman = Big.max(accruedHdxBig, 0).toString()
  // const accruedPct =
  //   Big(principalHdxHuman).gt(0) && accruedHdxBig.gt(0)
  //     ? accruedHdxBig.div(principalHdxHuman).times(100).toNumber()
  //     : 0

  // const hasPosition = Big(stakedHdxHuman).gt(0)

  const pendingHdxBig = claimableRewards
    ? Big(scaleHuman(claimableRewards.pendingHdx, native.decimals))
    : Big(0)
  const allocReadyHdxBig = claimableRewards
    ? Big(scaleHuman(claimableRewards.allocReadyHdx, native.decimals))
    : Big(0)

  const lockedHdxBig = claimableRewards
    ? Big(scaleHuman(claimableRewards.lockedHdx, native.decimals))
    : Big(0)
  const lockedHdxHuman = lockedHdxBig.toString()
  const hasLockedShares = lockedHdxBig.gt("0.000001")
  const claimableTotalBig = pendingHdxBig.plus(allocReadyHdxBig)
  const claimableTotalHuman = claimableTotalBig.toString()

  const hasClaimable = claimableTotalBig.gt("0.000001")
  const claimAndCompoundArgs = {
    allocReadyVotes: claimableRewards?.allocReadyVotes ?? [],
    unlockClasses: claimableRewards?.unlockClasses ?? [],
    accountAddress: account?.address ?? "",
    hasAccruedYield: accruedHdxBig.gt("0.000001"),
    hasClaimableRewards: pendingHdxBig.plus(allocReadyHdxBig).gt("0.000001"),
  }

  const liquidationPriceHollarPerHdx = useMemo(() => {
    if (!userSummary || !hdxReserve || !hollarReserve) return null

    const debtHollar = Big(hollarReserve.variableBorrows || "0")
    if (debtHollar.lte(0)) return null

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

    const liqPxHollarPerGhdx = debtHollar.div(qtyCollateral.times(ltNum))

    const rate = Big(exchangeRate?.toString() || "0")
    if (rate.lte(0)) return null

    return liqPxHollarPerGhdx.div(rate)
  }, [
    userSummary,
    hdxReserve,
    hollarReserve,
    gigaHdxBalanceHuman,
    exchangeRate,
  ])
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

          <Flex direction="column" justify="space-between" gap="xs">
            <Text
              font="primary"
              fw={500}
              fs={["p6", "base"]}
              lh={1}
              color={getToken("text.high")}
            >
              {t("gigaStaking.position.title")}
            </Text>
            <Text
              fs={[pxToRem(9), "p6"]}
              lh={1}
              color={getToken("text.medium")}
            >
              {t("gigaStaking.position.desc")}
            </Text>
          </Flex>

          <Amount
            value={
              <Text
                font="primary"
                fs={["p3", "p3", "p3", "h6"]}
                lh={1}
                fw={500}
                color={getToken("text.tint.secondary")}
              >
                {t("common:currency", {
                  value: Big(gigaHdxBalanceHuman)
                    .times(exchangeRate?.toString() || "0")
                    .toString(),
                  symbol: native.symbol,
                })}
              </Text>
            }
            displayValue={t("gigaStaking.position.underlying.value", {
              value: gigaHdxBalanceHuman,
              displayValue: t("common:currency", {
                value: gigaHdxBalanceUsd,
              }),
              symbol: ghdxMeta.symbol,
            })}
            sx={{ ml: "auto", textAlign: "right" }}
          />
        </Flex>

        {hasDebt && (
          <>
            <Separator />
            <Stack
              direction={["column", "column", "column", "row"]}
              gap={["xl", null]}
              justify="start"
              py={["l", "l"]}
              px={["m", "xl"]}
              separated
            >
              {/* {hasPosition && (
                <ValueStats
                  size="small"
                  label={t("staking:gigaStaking.position.principal.label")}
                  wrap={[false, false, false, true]}
                  isLoading={isAccountStakeLoading}
                  customValue={
                    <Text
                      font="primary"
                      fw={500}
                      fs={["p3", "p3", "h7"]}
                      lh={1}
                      color={getToken("text.high")}
                    >
                      {t("common:currency", {
                        value: principalHdxHuman,
                        symbol: native.symbol,
                      })}
                    </Text>
                  }
                />
              )}
              {hasPosition && (
                <ValueStats
                  size="small"
                  label={t("staking:gigaStaking.position.accrued.label")}
                  wrap={[false, false, false, true]}
                  isLoading={isExchangeRateLoading}
                  customValue={
                    <Flex align="baseline" gap="xs">
                      <Text
                        font="primary"
                        fw={500}
                        fs={["p3", "p3", "h7"]}
                        lh={1}
                        color={getToken(
                          accruedHdxBig.gt(0)
                            ? "text.tint.primary"
                            : "text.high",
                        )}
                      >
                        {accruedHdxBig.gt(0) ? "+" : ""}
                        {t("common:currency", {
                          value: accruedHdxHuman,
                          symbol: native.symbol,
                        })}
                      </Text>
                      {accruedPct > 0 && (
                        <Text
                          fs="p6"
                          lh={1}
                          color={getToken("text.tint.primary")}
                        >
                          ({t("common:percent", { value: accruedPct })})
                        </Text>
                      )}
                    </Flex>
                  }
                />
              )} */}
              {hasDebt && (
                <ValueStats
                  size="small"
                  label={t("borrow:healthFactor")}
                  wrap={[false, false, false, true]}
                  isLoading={isLoading}
                  customValue={
                    <Text
                      font="primary"
                      fw={500}
                      fs={["p3", "p3", "h7"]}
                      lh={1}
                      sx={{ color: healthFactorColor }}
                    >
                      {healthFactor !== "-1" ? healthFactor : "-"}
                    </Text>
                  }
                />
              )}
              {hasDebt && (
                <LiquidationPrice
                  isLoading={isLoading}
                  liquidationPriceHollarPerHdx={liquidationPriceHollarPerHdx}
                  hollarAssetId={HOLLAR_ASSET_ID}
                  nativeAssetId={native.id}
                  symbol={`${hollarReserve?.reserve.symbol ?? ""}/${native.symbol}`}
                />
              )}
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
                fs={["p3", "p3", "base"]}
                lh={1}
                color={getToken("text.high")}
              >
                {t("gigaStaking.position.borrows.title")}
              </Text>

              <Text fw={500} fs="p5" lh={1} color={getToken("text.medium")}>
                <Trans
                  t={t}
                  i18nKey="gigaStaking.position.borrow.apy"
                  values={{
                    value:
                      Number(hollarReserve?.reserve.variableBorrowAPY ?? 0) *
                      100,
                  }}
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
                        fs={["p3", "p3", "base"]}
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
                      fs={["p3", "p3", "base"]}
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
            <SChartLegendContainer asChild>
              <Flex direction="column" gap="l" justify="space-between">
                <Flex justify="space-between" align="center">
                  <Amount
                    label={
                      <Text
                        fs={["p6", "p6", "p4"]}
                        lh={1}
                        color={getToken("text.medium")}
                      >
                        {t("gigaStaking.claim.label")}
                      </Text>
                    }
                    value={
                      <Text
                        font="primary"
                        fs={["p3", "p1", "h5"]}
                        fw={500}
                        lh={1}
                        color={getToken("text.tint.primary")}
                      >
                        {t("common:currency", {
                          value: claimableTotalHuman,
                          symbol: native.symbol,
                        })}
                      </Text>
                    }
                  />

                  <Button
                    variant="secondary"
                    size={isMobile || isTablet ? "medium" : "large"}
                    disabled={!hasClaimable || claimMutation.isPending}
                    onClick={() => claimMutation.mutate(claimAndCompoundArgs)}
                  >
                    {t("gigaStaking.claim.cta")}
                  </Button>
                </Flex>

                <Separator />

                <Text
                  fs={["p5", "p5", "p2"]}
                  lh="m"
                  color={getToken("text.medium")}
                >
                  {t("staking:gigaStaking.rewards.desc")}
                </Text>
              </Flex>
            </SChartLegendContainer>

            {hasLockedShares && (
              <Text fs="p6" lh="m" color={getToken("text.low")}>
                {t("staking:gigaStaking.claim.locked", {
                  value: lockedHdxHuman,
                  symbol: native.symbol,
                })}
              </Text>
            )}
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

const LiquidationPrice = ({
  isLoading,
  liquidationPriceHollarPerHdx,
  hollarAssetId,
  nativeAssetId,
  symbol,
}: {
  isLoading: boolean
  liquidationPriceHollarPerHdx: Big | null
  symbol: string
  hollarAssetId: string
  nativeAssetId: string
}) => {
  const { t } = useTranslation(["common", "staking"])
  const rpc = useRpcProvider()

  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPriceQuery(rpc, nativeAssetId, hollarAssetId),
  )

  const spotDropToLiquidationPercent = useMemo(() => {
    if (!liquidationPriceHollarPerHdx || !spotPriceData?.spotPrice) return null

    const spotPrice = Big(spotPriceData.spotPrice)
    if (spotPrice.lte(0)) return null

    const dropPercent = spotPrice
      .minus(liquidationPriceHollarPerHdx)
      .div(spotPrice)
      .times(100)

    if (dropPercent.lte(0)) return null

    return dropPercent.toNumber()
  }, [liquidationPriceHollarPerHdx, spotPriceData?.spotPrice])

  return (
    <ValueStats
      size="small"
      label={t("staking:gigaStaking.position.liquidationPrice.label")}
      wrap={[false, false, false, true]}
      isLoading={isLoading || isSpotPricePending}
      customValue={
        <Stack
          direction={["column", "column", "column", "row"]}
          align="end"
          gap="xs"
        >
          <Text
            font="primary"
            fw={500}
            fs={["p3", "p3", "h7"]}
            lh={1}
            color={getToken("text.high")}
          >
            {liquidationPriceHollarPerHdx
              ? t("currency", {
                  value: liquidationPriceHollarPerHdx
                    .round(18, Big.roundHalfUp)
                    .toFixed(),
                  symbol,
                })
              : "-"}
          </Text>
          {spotDropToLiquidationPercent !== null && (
            <Text fs="p6" lh={1} color={getToken("text.medium")}>
              (
              {t("staking:gigaStaking.position.liquidationPrice.spotDrop", {
                value: spotDropToLiquidationPercent,
              })}
              )
            </Text>
          )}
        </Stack>
      }
    />
  )
}
