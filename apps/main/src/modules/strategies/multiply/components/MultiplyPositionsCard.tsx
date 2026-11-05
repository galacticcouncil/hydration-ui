import {
  Amount,
  Box,
  Button,
  Chip,
  ChipProps,
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  Grid,
  Icon,
  LoadingButton,
  Paper,
  PositionCard,
  Separator,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { useAccountBalances } from "@/api/balances/account.hooks"
import { AssetLogo } from "@/components/AssetLogo"
import { HealthFactorNumber } from "@/modules/money-market/health-factor/HealthFactorNumber"
import { MultiplyAmountModal } from "@/modules/strategies/multiply/components/MultiplyAmountModal"
import { MultiplyDepositSummary } from "@/modules/strategies/multiply/components/MultiplyDepositSummary"
import { type MultiplyPairRow } from "@/modules/strategies/multiply/components/MultiplyPairs.columns"
import {
  SChevron,
  SPositionHeader,
  SStats,
  STAT_COLUMN_WIDTH,
} from "@/modules/strategies/multiply/components/MultiplyPositionsCard.styled"
import { MultiplyProgress } from "@/modules/strategies/multiply/components/MultiplyProgress"
import { MultiplyWithdrawSummary } from "@/modules/strategies/multiply/components/MultiplyWithdrawSummary"
import { Ladder, Stall } from "@/modules/strategies/multiply/config/abi"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import {
  type MultiplyPosition,
  useMultiplyPositions,
} from "@/modules/strategies/multiply/hooks/useMultiplyPositions"
import { useMultiplyPositionWrites } from "@/modules/strategies/multiply/hooks/useMultiplyPositionWrites"
import { getNetApy } from "@/modules/strategies/multiply/utils/projection"
import {
  getMultiplyPositionStatus,
  getMultiplyProgress,
  isRungExpired,
  type MultiplyPositionStatus,
} from "@/modules/strategies/multiply/utils/status"
import { useAssets } from "@/providers/assetsProvider"

const WAD_DECIMALS = 18
// Aave reports uint256.max when there is no debt.
const NO_DEBT_HF = "-1"

const statusVariant: Record<MultiplyPositionStatus, ChipProps["variant"]> = {
  active: "green",
  building: "blue",
  withdrawing: "cyan",
  closing: "amber",
  paused: "red",
}

const stallKey = (stall: Stall) => {
  const name = Stall[stall]
  return `${name.charAt(0).toLowerCase()}${name.slice(1)}` as
    | "aaveRefused"
    | "intentRejected"
    | "intentTooSmall"
    | "insufficientHeadroom"
    | "tailUnfunded"
    | "returned"
    | "cancelled"
    | "feeBudgetLow"
}

type ModalKind = "deposit" | "withdraw"

export const MultiplyPositionsCard: React.FC<{
  pairs: MultiplyPairRow[]
}> = ({ pairs }) => {
  const { t } = useTranslation("strategies")
  const { data: positions } = useMultiplyPositions()

  if (!positions?.length) return null

  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("multiply.positions.title")}
        </Text>
      </Box>
      <Separator />
      <Flex direction="column" gap="m" p="m">
        {pairs.map(({ pair, data, collateralReserve, debtReserve }) => {
          const pairPositions = positions.filter(
            (p) => p.pair.slug === pair.slug,
          )
          if (!pairPositions.length) return null
          return (
            <MultiplyPairPositions
              key={pair.slug}
              pair={pair}
              positions={pairPositions}
              collateralPriceUsd={Number(collateralReserve?.priceInUsd ?? 0)}
              debtPriceUsd={Number(debtReserve?.priceInUsd ?? 0)}
              supplyApy={data?.supplyApy ?? null}
              borrowApy={data?.borrowApy ?? null}
            />
          )
        })}
      </Flex>
    </Paper>
  )
}

type MultiplyPairPositionsProps = {
  pair: MultiplyPair
  positions: MultiplyPosition[]
  collateralPriceUsd: number
  debtPriceUsd: number
  supplyApy: number | null
  borrowApy: number | null
}

const MultiplyPairPositions: React.FC<MultiplyPairPositionsProps> = ({
  pair,
  positions,
  collateralPriceUsd,
  debtPriceUsd,
  supplyApy,
  borrowApy,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const writes = useMultiplyPositionWrites(pair)
  const { getAssetWithFallback } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const [openIds, setOpenIds] = useState<Set<bigint>>(new Set())
  const [modal, setModal] = useState<{
    kind: ModalKind
    position: MultiplyPosition
  } | null>(null)

  const collateral = getAssetWithFallback(pair.collateralAssetId)
  const debt = getAssetWithFallback(pair.debtAssetId)
  const feeAsset = getAssetWithFallback(pair.feeAssetId)

  const amount = (value: bigint) => formatUnits(value, collateral.decimals)
  const leverage = (wad: bigint) => Number(formatUnits(wad, WAD_DECIMALS))

  const stat = (label: string, value: React.ReactNode, bottom?: string) => (
    <ValueStats
      wrap
      size="small"
      font="secondary"
      label={label}
      customValue={
        <Text fs="p3" fw={500} lh={1}>
          {value}
        </Text>
      }
      bottomLabel={bottom}
    />
  )

  return (
    <>
      {positions.map((position) => {
        const now = Date.now()
        const status = getMultiplyPositionStatus(position, now)
        const current = leverage(position.leverage)
        const target = leverage(position.targetLeverage)
        const progress = getMultiplyProgress(status, current, target)
        const nav = Number(amount(position.nav))
        // the collateral held; leverage is collateral / net value
        const size = nav * current
        // what the debt is worth in collateral is what separates size from net value
        const debtAmount =
          debtPriceUsd > 0
            ? ((size - nav) * collateralPriceUsd) / debtPriceUsd
            : 0
        const pnl = Number(amount(position.pnl))
        const principal = Number(amount(position.principal))
        const netApy =
          supplyApy !== null && borrowApy !== null
            ? getNetApy(current, supplyApy, borrowApy)
            : null
        const reason =
          status !== "paused"
            ? null
            : isRungExpired(position, now)
              ? t("multiply.stall.expired")
              : t(`multiply.stall.${stallKey(position.stalled)}`)

        const isBusy = status !== "active" && status !== "paused"
        const canDeposit = position.ladder === Ladder.None
        const hf =
          position.healthFactor >= 2n ** 255n
            ? NO_DEBT_HF
            : formatUnits(position.healthFactor, WAD_DECIMALS)

        const statusChip =
          progress !== null ? (
            <MultiplyProgress
              // a ramp climbs to target, a close comes down to 1×: a new ladder starts a new bar instead of counting from the other's percent
              key={status}
              label={t(`multiply.status.${status}`)}
              progress={progress}
              leverage={current}
            />
          ) : (
            <Chip variant={statusVariant[status]} rounded size="small">
              {t(`multiply.status.${status}`)}
            </Chip>
          )

        const pnlPercent = t("common:percent", {
          prefix: pnl > 0 ? "+" : "",
          value: principal > 0 ? (pnl / principal) * 100 : 0,
        })
        const cur = (value: number, symbol: string, signed = false) =>
          t("common:currency", {
            prefix: signed && value > 0 ? "+" : "",
            value,
            symbol,
          })
        const isOpen = openIds.has(position.id)
        const toggle = () =>
          setOpenIds((ids) => {
            const next = new Set(ids)
            if (!next.delete(position.id)) next.add(position.id)
            return next
          })

        return (
          <CollapsibleRoot
            key={position.id.toString()}
            open={isOpen}
            onOpenChange={toggle}
          >
            <Paper bg="dim" shadow={false} borderRadius="m">
              <SPositionHeader
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={toggle}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return
                  e.preventDefault()
                  toggle()
                }}
              >
                <PositionCard
                  logo={
                    <AssetLogo
                      id={[pair.collateralAssetId, pair.debtAssetId]}
                      size="medium"
                    />
                  }
                  symbol={
                    <Stack gap="xs">
                      <Flex align="center" gap="xl">
                        <Amount
                          value={t("common:currency", {
                            value: size,
                            symbol: collateral.symbol,
                          })}
                          displayValue={t("common:currency", {
                            value: size * collateralPriceUsd,
                          })}
                        />
                        {status === "paused" && statusChip}
                      </Flex>
                      {reason && (
                        <Text
                          fs="p6"
                          color={getToken("accents.danger.emphasis")}
                        >
                          {reason}
                        </Text>
                      )}
                    </Stack>
                  }
                  // one column: the stats spread evenly between the value and the actions
                  columns={1}
                  stats={
                    <SStats>
                      <ValueStats
                        wrap
                        size="small"
                        font="secondary"
                        label={t("multiply.positions.pnl")}
                        customValue={
                          <Text fs="p3" fw={500} lh={1}>
                            {cur(pnl, collateral.symbol, true)}{" "}
                            <Text
                              as="span"
                              color={
                                pnl > 0
                                  ? getToken("accents.success.emphasis")
                                  : pnl < 0
                                    ? getToken("accents.danger.emphasis")
                                    : undefined
                              }
                            >
                              ({pnlPercent})
                            </Text>
                          </Text>
                        }
                      />
                      {stat(
                        t("multiply.open.netApy"),
                        netApy !== null ? (
                          <Text
                            as="span"
                            color={
                              netApy > 0
                                ? getToken("accents.success.emphasis")
                                : undefined
                            }
                          >
                            {t("common:percent", { value: netApy * 100 })}
                          </Text>
                        ) : (
                          "-"
                        ),
                      )}
                    </SStats>
                  }
                  cta={
                    <Flex align="center" gap="m">
                      {/* the actions act on their own, not on the card */}
                      <Flex
                        align="center"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        {isBusy ? (
                          statusChip
                        ) : (
                          <Flex gap="xs" align="center">
                            {status === "paused" && (
                              <LoadingButton
                                size="small"
                                isLoading={writes.resume.isPending}
                                onClick={() => writes.resume.mutate(position)}
                              >
                                {t("multiply.action.resume")}
                              </LoadingButton>
                            )}
                            {canDeposit && (
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() =>
                                  setModal({ kind: "deposit", position })
                                }
                              >
                                {t("common:deposit")}
                              </Button>
                            )}
                            {/* a paused rung still in flight must be resumed first */}
                            {position.pendingKind === 0 && (
                              <Button
                                variant="tertiary"
                                size="small"
                                onClick={() =>
                                  setModal({ kind: "withdraw", position })
                                }
                              >
                                {t("common:withdraw")}
                              </Button>
                            )}
                          </Flex>
                        )}
                      </Flex>
                      <SChevron isOpen={isOpen} aria-hidden>
                        <Icon component={ChevronDown} size="m" />
                      </SChevron>
                    </Flex>
                  }
                />
              </SPositionHeader>
              <CollapsibleContent>
                <Separator />
                {/* fit the card, not the viewport: it shares the row with the open form */}
                <Grid
                  columnWidth={STAT_COLUMN_WIDTH}
                  repeat="fill"
                  columnGap="l"
                  rowGap="l"
                  p="l"
                >
                  {stat(
                    t("multiply.details.collateral"),
                    cur(size, collateral.symbol),
                    t("common:currency", {
                      value: size * collateralPriceUsd,
                    }),
                  )}
                  {stat(
                    t("multiply.details.debt"),
                    cur(debtAmount, debt.symbol),
                    t("common:currency", {
                      value: debtAmount * debtPriceUsd,
                    }),
                  )}
                  {stat(
                    t("common:healthFactor"),
                    <HealthFactorNumber value={hf} />,
                  )}
                  {stat(
                    t("multiply.positions.leverage"),
                    t("cards.multiply.leverage", { value: current }),
                    t("multiply.positions.target", {
                      value: t("cards.multiply.leverage", { value: target }),
                    }),
                  )}
                  {stat(
                    t("multiply.positions.netValue"),
                    cur(nav, collateral.symbol),
                    t("common:currency", { value: nav * collateralPriceUsd }),
                  )}
                  {stat(
                    t("multiply.positions.deposited"),
                    cur(principal, collateral.symbol),
                  )}
                  {stat(
                    t("multiply.open.feeBudget"),
                    cur(
                      Number(
                        formatUnits(position.feeBudget, feeAsset.decimals),
                      ),
                      feeAsset.symbol,
                    ),
                  )}
                </Grid>
              </CollapsibleContent>
            </Paper>
          </CollapsibleRoot>
        )
      })}

      {modal?.kind === "deposit" && (
        <MultiplyAmountModal
          title={t("multiply.deposit.title", {
            id: modal.position.id.toString(),
          })}
          cta={t("multiply.deposit.cta")}
          summary={(value) => (
            <MultiplyDepositSummary
              pair={pair}
              position={modal.position}
              amount={value}
              collateralPriceUsd={collateralPriceUsd}
              debtPriceUsd={debtPriceUsd}
            />
          )}
          asset={collateral}
          max={amount(getTransferableBalance(pair.collateralAssetId))}
          maxLabel={t("common:balance")}
          priceUsd={collateralPriceUsd}
          isPending={writes.deposit.isPending}
          onSubmit={(value) => {
            writes.deposit.mutate({ position: modal.position, amount: value })
            setModal(null)
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === "withdraw" && (
        <MultiplyAmountModal
          title={t("multiply.withdraw.title", {
            id: modal.position.id.toString(),
          })}
          cta={t("multiply.withdraw.cta")}
          maxCta={t("multiply.withdraw.maxCta")}
          note={t("multiply.withdraw.note", { symbol: collateral.symbol })}
          maxNote={t("multiply.withdraw.maxNote", { debt: debt.symbol })}
          summary={(value, isMax) => (
            <MultiplyWithdrawSummary
              pair={pair}
              position={modal.position}
              amount={value}
              isMax={isMax}
              collateralPriceUsd={collateralPriceUsd}
              debtPriceUsd={debtPriceUsd}
            />
          )}
          asset={collateral}
          max={amount(modal.position.nav)}
          maxLabel={t("multiply.positions.netValue")}
          priceUsd={collateralPriceUsd}
          isPending={writes.withdraw.isPending || writes.close.isPending}
          onSubmit={(value, isMax) => {
            // max is the net value as last read; close() empties the position
            // even after interest has moved it, a withdraw of it could leave dust
            if (isMax) writes.close.mutate(modal.position)
            else
              writes.withdraw.mutate({
                position: modal.position,
                amount: value,
              })
            setModal(null)
          }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
