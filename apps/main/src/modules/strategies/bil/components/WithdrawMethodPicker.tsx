import { Hourglass, Zap } from "@galacticcouncil/ui/assets/icons"
import {
  Chip,
  ChipVariant,
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import type { ComponentType, SVGProps } from "react"
import { useTranslation } from "react-i18next"

import { SMethodCard } from "./WithdrawMethodPicker.styled"

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
  /** Amount the user is withdrawing, in BIL. */
  amountBil: number
  /** Current vault exchange rate (1 BIL = N HOLLAR, today). */
  exchangeRate: number
  /** Vault APR % — drives the forward-projection of exchangeRate to fulfillment. */
  aprPercent: number
  /** Worst-case days until the queue settles (your actual fulfillment time). */
  worstCaseWaitDays: number
  /** Days until the next vault position matures, regardless of queue.
      In the no-queue-contention case this equals worstCaseWaitDays. */
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

export const WithdrawMethodPicker = ({
  selected,
  onSelect,
  amountBil,
  exchangeRate,
  aprPercent,
  worstCaseWaitDays,
  //nextMaturityDays,
  instantQuote,
  instantAvailable,
}: Props) => {
  const { t } = useTranslation(["strategies", "common"])

  const projectedRate = projectRate(exchangeRate, aprPercent, worstCaseWaitDays)
  const queueHollarOut = amountBil * projectedRate

  return (
    <Flex direction="column" gap="base">
      <MethodCard
        active={selected === "queue"}
        onClick={() => onSelect("queue")}
      >
        <CardHeader
          title={t("bil.method.queue.title")}
          subtitle={t("bil.method.queue.subtitle")}
          icon={Hourglass}
          rightChip={t("bil.method.queue.upToDays", {
            days: worstCaseWaitDays,
          })}
          rightChipVariant="secondary"
        />
        <CollapsibleRoot open={selected === "queue" && queueHollarOut > 0}>
          <CollapsibleContent>
            <Separator
              my="m"
              bg={getToken("text.high")}
              sx={{ opacity: 0.1 }}
            />
            <DetailRow
              label={t("bil.method.queue.youReceive")}
              value={t("common:currency", {
                value: queueHollarOut,
                symbol: "HOLLAR",
              })}
            />
            <DetailRow
              label={t("bil.method.queue.atRate")}
              value={t("bil.method.queue.atRateValue", {
                rate: t("common:number", {
                  value: projectedRate,
                }),
              })}
            />
            <DetailRow
              label={t("bil.method.queue.delay")}
              value={t("bil.method.queue.delayValue")}
            />
          </CollapsibleContent>
        </CollapsibleRoot>
      </MethodCard>

      <MethodCard
        active={selected === "instant"}
        onClick={() => onSelect("instant")}
        disabled={!instantAvailable}
      >
        <CardHeader
          title={t("bil.method.instant.title")}
          icon={Zap}
          subtitle={
            instantAvailable
              ? t("bil.method.instant.subtitleAvailable")
              : t("bil.method.instant.subtitleUnavailable")
          }
          rightChip={t("bil.method.instant.chip")}
          rightChipVariant="primary"
        />
        <CollapsibleRoot open={selected === "instant" && !!instantQuote}>
          <CollapsibleContent>
            {instantQuote && (
              <>
                <Separator
                  my="m"
                  bg={getToken("text.high")}
                  sx={{ opacity: 0.1 }}
                />
                {/* Concrete payout comparison: instant now vs queue in N days,
                    then the absolute HOLLAR difference (signed). Replaces an
                    earlier "-2.8% discount" abstract — users found it easier
                    to reason about real numbers than a percentage. */}
                <DetailRow
                  label={t("bil.method.instant.youReceiveNow")}
                  value={t("common:currency", {
                    value: instantQuote.expectedHollar,
                    symbol: "HOLLAR",
                  })}
                />
                <DetailRow
                  label={t("bil.method.instant.youReceiveQueue", {
                    days: worstCaseWaitDays,
                  })}
                  value={t("common:currency", {
                    value: queueHollarOut,
                    symbol: "HOLLAR",
                  })}
                />
                <DetailRow
                  label={t("bil.method.instant.difference")}
                  value={(() => {
                    const delta = instantQuote.expectedHollar - queueHollarOut
                    return `${t("common:currency", {
                      value: delta,
                      symbol: "HOLLAR",
                      signDisplay: "always",
                    })} (${t("common:percent", {
                      value: instantQuote.discountPct,
                      signDisplay: "always",
                    })})`
                  })()}
                  valueTone={
                    instantQuote.discountPct < 0 ? "warning" : "neutral"
                  }
                />
                <DetailRow
                  label={t("bil.method.instant.slippage")}
                  value={t("common:percent", {
                    value: instantQuote.slippagePct,
                  })}
                />
              </>
            )}
          </CollapsibleContent>
        </CollapsibleRoot>
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
  <SMethodCard
    type="button"
    active={active}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </SMethodCard>
)

const CardHeader = ({
  title,
  subtitle,
  rightChip,
  rightChipVariant,
  icon: Icon,
}: {
  title: string
  subtitle: string
  rightChip: string
  rightChipVariant: ChipVariant
  icon?: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>
}) => (
  <Flex justify="space-between" align="flex-start" gap="s">
    <Flex direction="column" gap="xxs">
      <Flex align="center" gap="xs">
        {Icon && <Icon size={14} />}
        <Text fs="p3" fw={600} color={getToken("text.high")}>
          {title}
        </Text>
      </Flex>
      <Text fs="p5" color={getToken("text.medium")}>
        {subtitle}
      </Text>
    </Flex>
    <Chip variant={rightChipVariant}>{rightChip}</Chip>
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
  <Flex justify="space-between" align="center" py="xs">
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
