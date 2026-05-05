import { Zap } from "@galacticcouncil/ui/assets/icons"
import {
  Chip,
  Flex,
  Paper,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import type { ComponentType, SVGProps } from "react"
import { useTranslation } from "react-i18next"

import { formatNumber } from "@/modules/hdcl-vault/utils/format"

import { type TimelineStop, WithdrawTimeline } from "./WithdrawTimeline"

export type WithdrawMethod = "queue" | "instant"

export interface InstantQuote {
  /** HOLLAR receivable from the secondary-market trade. */
  expectedHollar: number
  /** Percentage discount vs queue (negative = receive less). */
  discountPct: number
  /** Pool slippage at the current trade size (positive percent). */
  slippagePct: number
}

interface Props {
  selected: WithdrawMethod
  onSelect: (method: WithdrawMethod) => void
  /** Amount the user is withdrawing, in HDCL. */
  amountHdcl: number
  /** Current vault exchange rate (1 HDCL = N HOLLAR, today). */
  exchangeRate: number
  /** Vault APR % — drives the forward-projection of exchangeRate to fulfillment. */
  aprPercent: number
  /** Worst-case days until the queue settles (your actual fulfillment time). */
  worstCaseWaitDays: number
  /** Days until the next vault position matures, regardless of queue.
      In the no-queue-contention case this equals worstCaseWaitDays - withdrawalDelay. */
  nextMaturityDays: number
  /** Stableswap quote — undefined while loading or when path unavailable. */
  instantQuote?: InstantQuote
  /** Whether the instant-redeem path is operational (stableswap deployed). */
  instantAvailable: boolean
}

/**
 * Project the current exchange rate forward to expected fulfillment time.
 * Compound at the vault APR over `days/365`. The vault keeps accruing yield
 * during the queue wait, so the user's HOLLAR payout uses the rate at
 * fulfillment, not the rate at queue-entry.
 *
 * Exported so the parent modal can compute the queue payout (used as the
 * baseline for the instant-redeem discount %).
 */
export const projectRate = (
  currentRate: number,
  aprPercent: number,
  days: number,
) => currentRate * Math.pow(1 + aprPercent / 100, days / 365)

/**
 * Method picker cards inside the Withdraw modal — Figma 7526:34522 / 35079 / 35082.
 *
 * Two stacked selectable cards. The selected card expands to show its detail
 * (timeline + breakdown for queue; quote breakdown for instant). The unselected
 * card collapses to its header.
 *
 * The instant card stays clickable but the modal's submit button gates on
 * `instantAvailable` until the secondary-market stableswap deploys.
 */
export const WithdrawMethodPicker = ({
  selected,
  onSelect,
  amountHdcl,
  exchangeRate,
  aprPercent,
  worstCaseWaitDays,
  nextMaturityDays,
  instantQuote,
  instantAvailable,
}: Props) => {
  const { t } = useTranslation("hdcl")
  // Project the exchange rate forward to fulfillment — the vault keeps
  // accruing yield during the queue wait, so the user's HOLLAR payout is
  // calculated against the rate at fulfillment, not today's rate.
  const projectedRate = projectRate(exchangeRate, aprPercent, worstCaseWaitDays)
  const queueHollarOut = amountHdcl * projectedRate

  // Timeline stops are read directly from contract state:
  //   Next maturity  = next vault position's maturityTime - now
  //   Est. receive   = worstCaseWaitDays (= maturity + delay in case B,
  //                    or queue-contention wait + delay in case A)
  // When no positions are active yet, fall back to a single "Est. receive"
  // stop based on the withdrawalDelay alone.
  const hasMaturity = nextMaturityDays > 0
  const timelineStops: TimelineStop[] = [
    {
      label: t("method.timeline.today"),
      sublabel: t("method.timeline.queueEntered"),
      status: "active",
    },
    ...(hasMaturity
      ? [
          {
            label: t("method.timeline.nextMaturity"),
            sublabel: t("method.timeline.dayN", { day: nextMaturityDays }),
            status: "future" as const,
          },
        ]
      : []),
    {
      label: t("method.timeline.estReceive"),
      sublabel: t("method.timeline.byDayN", { day: worstCaseWaitDays }),
      status: "future" as const,
    },
  ]

  return (
    <Flex direction="column" gap={12}>
      {/* Queue method card */}
      <MethodCard
        active={selected === "queue"}
        onClick={() => onSelect("queue")}
      >
        <CardHeader
          title={t("method.queue.title")}
          subtitle={t("method.queue.subtitle")}
          rightChip={t("method.queue.upToDays", { days: worstCaseWaitDays })}
        />
        {selected === "queue" && (
          <>
            <Separator sx={{ my: "m" }} />
            <WithdrawTimeline stops={timelineStops} />
            <Separator sx={{ my: "m" }} />
            <DetailRow
              label={t("method.queue.youReceive")}
              value={t("method.queue.youReceiveValue", {
                amount: formatNumber(queueHollarOut, 2),
              })}
            />
            <DetailRow
              label={t("method.queue.atRate")}
              value={t("method.queue.atRateValue", {
                rate: formatNumber(projectedRate, 4),
              })}
            />
            <DetailRow
              label={t("method.queue.delay")}
              value={t("method.queue.delayValue")}
            />
          </>
        )}
      </MethodCard>

      {/* Instant method card */}
      <MethodCard
        active={selected === "instant"}
        onClick={() => onSelect("instant")}
        disabled={!instantAvailable}
      >
        <CardHeader
          title={t("method.instant.title")}
          icon={Zap}
          subtitle={
            instantAvailable
              ? t("method.instant.subtitleAvailable")
              : t("method.instant.subtitleUnavailable")
          }
          rightChip={t("method.instant.chip")}
        />
        {selected === "instant" && instantQuote && (
          <>
            <Separator sx={{ my: "m" }} />
            {/* Concrete payout comparison: instant now vs queue in N days,
                then the absolute HOLLAR difference (signed). Replaces an
                earlier "-2.8% discount" abstract — users found it easier
                to reason about real numbers than a percentage. */}
            <DetailRow
              label={t("method.instant.youReceiveNow")}
              value={t("method.instant.amountValue", {
                amount: formatNumber(instantQuote.expectedHollar, 2),
              })}
            />
            <DetailRow
              label={t("method.instant.youReceiveQueue", {
                days: worstCaseWaitDays,
              })}
              value={t("method.instant.amountValue", {
                amount: formatNumber(queueHollarOut, 2),
              })}
            />
            <DetailRow
              label={t("method.instant.difference")}
              value={(() => {
                const delta = instantQuote.expectedHollar - queueHollarOut
                const sign = delta >= 0 ? "+" : ""
                const pctSign = instantQuote.discountPct >= 0 ? "+" : ""
                return `${sign}${formatNumber(delta, 2)} HOLLAR (${pctSign}${formatNumber(instantQuote.discountPct, 1)}%)`
              })()}
              valueTone={instantQuote.discountPct < 0 ? "warning" : "neutral"}
            />
            <DetailRow
              label={t("method.instant.slippage")}
              value={`~${formatNumber(instantQuote.slippagePct, 2)}%`}
            />
          </>
        )}
      </MethodCard>
    </Flex>
  )
}

const MethodCard = ({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) => (
  <Paper
    variant={active ? "bordered" : "plain"}
    p={16}
    sx={{
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      borderColor: active ? "accents.info.primary" : "details.borders",
    }}
    onClick={() => {
      if (!disabled) onClick()
    }}
  >
    {children}
  </Paper>
)

const CardHeader = ({
  title,
  subtitle,
  rightChip,
  icon: Icon,
}: {
  title: string
  subtitle: string
  rightChip: string
  icon?: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>
}) => (
  <Flex justify="space-between" align="flex-start" gap={12}>
    <Flex direction="column" gap={2}>
      <Flex align="center" gap={6}>
        {Icon && <Icon size={14} />}
        <Text fs="p3" fw={600} color={getToken("text.high")}>
          {title}
        </Text>
      </Flex>
      <Text fs="p5" color={getToken("text.medium")}>
        {subtitle}
      </Text>
    </Flex>
    <Chip>{rightChip}</Chip>
  </Flex>
)

const DetailRow = ({
  label,
  value,
  valueTone = "neutral",
}: {
  label: string
  value: React.ReactNode
  valueTone?: "neutral" | "warning"
}) => (
  <Flex justify="space-between" align="center" sx={{ py: "s" }}>
    <Text fs="p5" color={getToken("text.medium")}>
      {label}
    </Text>
    <Text
      fs="p4"
      fw={500}
      color={valueTone === "warning" ? "accents.alert.primary" : "text.high"}
    >
      {value}
    </Text>
  </Flex>
)
