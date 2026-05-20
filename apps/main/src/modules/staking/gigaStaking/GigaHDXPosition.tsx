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
  Tooltip,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { Trans, useTranslation } from "react-i18next"

import { useUserGigaBorrowSummary } from "@/api/borrow"
import {
  claimableVotingRewardsQuery,
  gigaAccountStakesQuery,
  useGigaStakeExchangeRate,
} from "@/api/gigaStake"
import { AssetLogo } from "@/components/AssetLogo"
import { GigaHDXBorrowModal } from "@/modules/staking/gigaStaking/borrow/GigaHDXBorrowModal"
import { GigaHDXDocLink } from "@/modules/staking/gigaStaking/GigaHDXDocLink"
import { useClaimAndCompound } from "@/modules/staking/gigaStaking/GigaHDXPosition.utils"
import { SRewardsContainer } from "@/modules/staking/gigaStaking/GigaStaking.styled"
import { GigaHDXRepayModal } from "@/modules/staking/gigaStaking/repay/GigaHDXRepayModal"
import { GigaHDXSupplyInfo } from "@/modules/staking/gigaStaking/supplyInfo/GigaHDXSupplyInfo"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const GigaHDXPosition = () => {
  const { t } = useTranslation(["staking", "common", "borrow"])
  const [borrowModalOpen, setBorrowModalOpen] = useState(false)

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
  // HDX-equivalent of the user's position (gigahdx × rate).
  // This is the value the user actually owns — the GIGAHDX balance is the
  // position token, but the HDX number is what matters for staking yield
  // and what they'd receive on full unstake.
  const stakedHdxHuman = Big(gigaHdxBalanceHuman)
    .times(exchangeRate?.toString() || "0")
    .toString()

  // Principal vs accrued breakdown.
  // `Stakes.hdx` is the runtime-tracked locked principal (HDX the user
  // originally deposited, plus any yield they've already crystallized via
  // `realizeYield`). The accrued portion = current value − principal; this
  // is what `realizeYield` would move into the principal in one tx.
  const principalHdxHuman = accountStake
    ? scaleHuman(accountStake.hdx, native.decimals)
    : "0"
  const accruedHdxBig = Big(stakedHdxHuman).minus(principalHdxHuman)
  const accruedHdxHuman = Big.max(accruedHdxBig, 0).toString()
  const accruedPct =
    Big(principalHdxHuman).gt(0) && accruedHdxBig.gt(0)
      ? accruedHdxBig.div(principalHdxHuman).times(100).toNumber()
      : 0
  // Hide the row entirely when there's no position to break down.
  const hasPosition = Big(stakedHdxHuman).gt(0)

  // "Rewards to claim" shows VOTING REWARDS ONLY — the two HDX flows that
  // actually need an explicit user action to land:
  //   • pendingHdx       — already-credited voting rewards (`claim_rewards`)
  //   • allocReadyHdx    — voting rewards earned but not yet in PendingRewards;
  //                         the batch's `removeVote` calls credit them first
  //
  // Passive yield (`accruedHdx`) is intentionally EXCLUDED here. It's already
  // working for the user inside their gigahdx position (the rate appreciation
  // is automatic — no action required). `realize_yield` only crystallises
  // accrued into `Stakes.hdx` (= principal), which is a no-op for the user's
  // economic position. The "Accrued yield" row on the breakdown already shows
  // the value; calling it a "reward to claim" misleads users into thinking
  // it's something they're missing out on by not clicking.
  //
  // `useClaimAndCompound` still folds `realize_yield` into the batch when
  // accrued > 0 — that lifts the vote-weight cap and is free to include.
  // Independent of UI surfacing.
  const pendingHdxBig = claimableRewards
    ? Big(scaleHuman(claimableRewards.pendingHdx, native.decimals))
    : Big(0)
  const allocReadyHdxBig = claimableRewards
    ? Big(scaleHuman(claimableRewards.allocReadyHdx, native.decimals))
    : Big(0)
  // Shares earned but excluded from the batch because their conviction lock
  // may still be active (winning side of an Approved/Rejected ref). Surfaced
  // separately so the user knows the value isn't lost — just deferred.
  const lockedHdxBig = claimableRewards
    ? Big(scaleHuman(claimableRewards.lockedHdx, native.decimals))
    : Big(0)
  const claimableTotalHdxBig = pendingHdxBig.plus(allocReadyHdxBig)
  // Anything over 1 µHDX is worth a tx (matches gigahdx pallet's rounding
  // tolerance — `MAX_GIGAPOT_ROUNDING_SHORTFALL = 1_000_000` plancks).
  const hasClaimable = claimableTotalHdxBig.gt("0.000001")
  // Display in GIGAHDX (the position-token unit users see in their wallet).
  // Storage / event amounts are HDX-denominated because that's what the
  // runtime moves through internally — `claim_rewards` converts HDX →
  // staked GIGAHDX on the fly via `pallet-gigahdx::do_stake`. So showing
  // GIGAHDX is what the user actually receives, just the unit the rest of
  // the My Stake card already uses.
  //
  // Conversion: `gigahdx_amount = hdx_amount / exchange_rate`. Falls back
  // to the HDX value when the rate isn't loaded yet (avoids flicker).
  const rateBig = exchangeRate ? Big(exchangeRate.toString()) : Big(1)
  const safeDiv = (hdx: Big) => (rateBig.gt(0) ? hdx.div(rateBig) : hdx)
  const claimableTotalGigaHdxBig = safeDiv(claimableTotalHdxBig)
  const claimableTotalGigaHdxHuman = claimableTotalGigaHdxBig.toString()
  const claimableTotalHdxHuman = claimableTotalHdxBig.toString()
  const lockedGigaHdxBig = safeDiv(lockedHdxBig)
  const lockedGigaHdxHuman = lockedGigaHdxBig.toString()
  const hasLockedShares = lockedHdxBig.gt("0.000001")
  const claimAndCompoundArgs = {
    allocReadyVotes: claimableRewards?.allocReadyVotes ?? [],
    unlockClasses: claimableRewards?.unlockClasses ?? [],
    accountAddress: account?.address ?? "",
    hasAccruedYield: accruedHdxBig.gt("0.000001"),
    hasClaimableRewards: pendingHdxBig.plus(allocReadyHdxBig).gt("0.000001"),
  }

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

  const principalStat = (
    <ValueStats
      size="small"
      label={t("staking:gigaStaking.position.principal.label")}
      wrap={[false, true]}
      value={t("common:currency", {
        value: principalHdxHuman,
        symbol: native.symbol,
      })}
    />
  )

  const accruedYieldStat = (
    <ValueStats
      size="small"
      label={t("staking:gigaStaking.position.accrued.label")}
      wrap={[false, true]}
      customValue={
        <Flex align="baseline" gap="xs">
          <Text
            font="primary"
            fw={500}
            fs="h7"
            lh={1}
            color={getToken(
              accruedHdxBig.gt(0) ? "accents.success.emphasis" : "text.high",
            )}
          >
            {accruedHdxBig.gt(0) ? "+" : ""}
            {t("common:currency", {
              value: accruedHdxHuman,
              symbol: native.symbol,
            })}
          </Text>
          {accruedPct > 0 && (
            <Text fs="p6" lh={1} color={getToken("accents.success.emphasis")}>
              ({t("common:percent", { value: accruedPct })})
            </Text>
          )}
        </Flex>
      }
    />
  )

  const healthFactorStat = (
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
  )

  const liquidationPriceStat = (
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
  )

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

          {/* Headline: GIGAHDX balance (stable position-token identity).
              Secondary: current HDX claim (gigahdx × rate) — what the
              position is worth right now, equals Principal + Accruing.
              Tertiary: USD equivalent. */}
          <Amount
            value={
              <Flex direction="column" gap="xs" align="flex-end">
                <Text
                  font="primary"
                  fs="h7"
                  lh={1}
                  fw={500}
                  color={getToken("text.tint.secondary")}
                >
                  {t("common:currency", {
                    value: gigaHdxBalanceHuman,
                    symbol: ghdxMeta.symbol,
                  })}
                </Text>
                <Text fs="p5" lh={1} color={getToken("text.medium")}>
                  {"≈ "}
                  {t("common:currency", {
                    value: stakedHdxHuman,
                    symbol: native.symbol,
                  })}
                  {" ("}
                  {t("common:currency", { value: gigaHdxBalanceUsd })}
                  {")"}
                </Text>
              </Flex>
            }
            sx={{ ml: "auto", textAlign: "right" }}
          />
        </Flex>

        {hasPosition && (
          <>
            <Separator />
            {hasDebt ? (
              <GigaPositionDebtStats
                principalStat={principalStat}
                accruedYieldStat={accruedYieldStat}
                healthFactorStat={healthFactorStat}
                liquidationPriceStat={liquidationPriceStat}
              />
            ) : (
              <Stack
                direction={["column", "column", "column", "row"]}
                gap={["xxl", null]}
                align={["stretch", null, null, "center"]}
                justify="space-between"
                py={["l", "l"]}
                px={["m", "xl"]}
                separated
              >
                {principalStat}
                {accruedYieldStat}
              </Stack>
            )}
            {/* No standalone "Realize yield" action — the call is auto-
                batched with vote actions where it materially helps
                (lifting the vote-weight cap = min(vote_amount, Stakes.hdx)
                to include accrued passive yield). For unstake / claim
                rewards it would add gas without user-visible benefit. */}
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

        {/* Rewards to claim — chart-less variant per the new design.
            Previously this was layered as a chart container (timeseries
            chart + legend block); the chart was removed and the rewards
            block now stands on its own with the same visual treatment. */}
        <Box px={["l", "xl"]} pb={["m", "xl"]}>
          <SRewardsContainer sx={{ mt: "xxl" }} asChild>
            <Flex direction="column" gap="l">
              <Flex justify="space-between" align="center">
                {/* Show the GIGAHDX-equivalent (= HDX/rate) — matches the
                    My Stake card's primary unit. HDX shown as secondary so
                    users can cross-reference with the storage / event
                    amounts they might see elsewhere. */}
                <Amount
                  label={t("gigaStaking.claim.label")}
                  value={
                    <Flex direction="column" gap="xs" align="flex-start">
                      <Text
                        font="primary"
                        fs="h5"
                        fw={500}
                        lh={1}
                        color={getToken("text.tint.primary")}
                      >
                        {t("common:currency", {
                          value: claimableTotalGigaHdxHuman,
                          symbol: ghdxMeta.symbol,
                        })}
                      </Text>
                      <Text fs="p6" lh={1} color={getToken("text.medium")}>
                        {"≈ "}
                        {t("common:currency", {
                          value: claimableTotalHdxHuman,
                          symbol: native.symbol,
                        })}
                      </Text>
                    </Flex>
                  }
                />

                <Tooltip asChild={false} text={t("gigaStaking.claim.tooltip")}>
                  <Button
                    variant="secondary"
                    size="large"
                    disabled={!hasClaimable || claimMutation.isPending}
                    onClick={() => claimMutation.mutate(claimAndCompoundArgs)}
                  >
                    {t("gigaStaking.claim.cta")}
                  </Button>
                </Tooltip>
              </Flex>

              {hasLockedShares && (
                <Text fs="p6" lh="m" color={getToken("text.low")}>
                  {t("staking:gigaStaking.claim.locked", {
                    value: lockedGigaHdxHuman,
                    symbol: ghdxMeta.symbol,
                  })}
                </Text>
              )}

              <Separator />

              <Text fs="p2" lh="m" color={getToken("text.medium")}>
                {t("staking:gigaStaking.rewards.desc")}
              </Text>
            </Flex>
          </SRewardsContainer>
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

type GigaPositionDebtStatsProps = {
  principalStat: ReactNode
  accruedYieldStat: ReactNode
  healthFactorStat: ReactNode
  liquidationPriceStat: ReactNode
}

const GigaPositionDebtStats = ({
  principalStat,
  accruedYieldStat,
  healthFactorStat,
  liquidationPriceStat,
}: GigaPositionDebtStatsProps) => {
  const measureRef = useRef<HTMLDivElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const node = measureRef.current
    if (!node) return

    let animationFrame = 0

    const updateOverflow = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        const nextHasOverflow = node.scrollWidth > node.clientWidth + 1
        setHasOverflow((current) =>
          current === nextHasOverflow ? current : nextHasOverflow,
        )
      })
    }

    updateOverflow()

    const resizeObserver = new ResizeObserver(updateOverflow)
    resizeObserver.observe(node)
    Array.from(node.children).forEach((child) => resizeObserver.observe(child))
    window.addEventListener("resize", updateOverflow)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateOverflow)
    }
  }, [accruedYieldStat, healthFactorStat, liquidationPriceStat, principalStat])

  return (
    <Box position="relative">
      <Box
        ref={measureRef}
        py={["l", "l"]}
        px={["m", "xl"]}
        sx={{
          position: "absolute",
          width: "100%",
          height: 0,
          boxSizing: "border-box",
          overflow: "hidden",
          pointerEvents: "none",
          visibility: "hidden",
        }}
      >
        <Stack
          direction="row"
          gap={["xxl", null]}
          align="center"
          justify="start"
          separated
        >
          {principalStat}
          {accruedYieldStat}
          {healthFactorStat}
          {liquidationPriceStat}
        </Stack>
      </Box>

      {hasOverflow ? (
        <Stack direction="column" py={["l", "l"]} px={["m", "xl"]}>
          <Stack
            direction={["column", "row"]}
            gap={["xxl", null]}
            align={["stretch", "center"]}
            justify="start"
            separated
          >
            {principalStat}
            {accruedYieldStat}
            {healthFactorStat}
          </Stack>
          <Separator sx={{ my: "l" }} />
          {liquidationPriceStat}
        </Stack>
      ) : (
        <Stack
          direction="row"
          gap={["xxl", null]}
          align="center"
          justify="start"
          py={["l", "l"]}
          px={["m", "xl"]}
          separated
        >
          {principalStat}
          {accruedYieldStat}
          {healthFactorStat}
          {liquidationPriceStat}
        </Stack>
      )}
    </Box>
  )
}
