import { useAccountSummary } from "@galacticcouncil/money-market-v2/react"
import type {
  IncentiveApr,
  ReserveSummary,
} from "@galacticcouncil/money-market-v2/types"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Stack,
  Summary,
  SummaryRowProps,
  SummaryRowValue,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC, ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"

import { UnavailableApy } from "@/components/DetailedApy/UnavailableApy"
import { PendingPosition } from "@/components/PendingPosition"
import {
  OpenAction,
  OpenActionModal,
} from "@/modules/money-market-v2/actions/ActionModal"
import { ApyRate } from "@/modules/money-market-v2/effectiveApy"
import { useUserAddress } from "@/modules/money-market-v2/hooks"
import {
  ACTION_ICONS,
  ApyCell,
  CollateralSwitch,
  NoData,
  ReadError,
} from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { useReserveApy } from "@/modules/money-market-v2/ReserveApyProvider"
import { useReserveDisplay } from "@/modules/money-market-v2/useReserveDisplay"

const ratio = (part: Big.BigSource, whole: Big.BigSource) =>
  Big(whole).gt(0) ? Big(part).div(whole).toFixed() : "0"

/** One side of the position: its amount, its action and its figures. */
const PositionCard: FC<{
  title: string
  logoId: string
  amount: string
  amountUsd: string
  action: ReactNode
  rows: SummaryRowProps[]
}> = ({ title, logoId, amount, amountUsd, action, rows }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <Stack px="l" pt="l" pb="base" gap="l">
      <PendingPosition
        assetId={logoId}
        value={amount}
        displayValue={amountUsd}
        action={action}
      />
      {/* the separators run through the card's padding, edge to edge */}
      <Summary
        rows={rows}
        withLeadingSeparator
        separator={<Separator mx="-l" />}
      />
    </Stack>
  </Card>
)

/**
 * The connected account's standing in one reserve, as a card per side. A side
 * the account does not hold has no card.
 */
export const MyPosition: FC<{ reserve: ReserveSummary }> = ({ reserve }) => {
  const { t } = useTranslation(["moneyMarket", "common"])
  const user = useUserAddress()
  const account = useAccountSummary(user)
  const { symbol, logoId } = useReserveDisplay(reserve)
  const apy = useReserveApy(reserve)
  const [open, setOpen] = useState<OpenAction | null>(null)

  if (!user) return null
  if (account.error) {
    return (
      <Card>
        <CardBody>
          <ReadError error={account.error} />
        </CardBody>
      </Card>
    )
  }

  const asset = reserve.underlyingAsset
  const acc = account.data?.account
  const position = account.data?.positions.find(
    (p) => p.underlyingAsset === asset,
  )
  if (!position) return null

  const supplied = position.underlyingBalance
  const suppliedUsd = position.underlyingBalanceUsd
  const borrowed = position.variableBorrows
  const borrowedUsd = position.variableBorrowsUsd

  const canBeCollateral =
    reserve.usageAsCollateralEnabled && Big(reserve.ltv).gt(0)
  // the category's terms replace the reserve's own while the account is in it
  const inEMode =
    !!acc?.eModeCategoryId && acc.eModeCategoryId === reserve.eModeCategoryId

  const usd = (value: Big.BigSource) =>
    t("common:currency", {
      value: Big(value).toFixed(),
      maximumFractionDigits: 2,
    })
  const tokens = (value: string) => t("common:currency", { value, symbol })
  const percent = (fraction: string) =>
    t("common:percent", { value: Number(fraction) * 100 })

  // a year at the effective APY - never a figure from a rate that is not known
  const yearly = (amountUsd: string, rate: ApyRate | undefined) => {
    if (!rate) return <NoData />
    if (rate.status === "loading") return <Skeleton width="4em" />
    if (rate.status === "unavailable") return <UnavailableApy />
    return usd(Big(amountUsd).times(rate.total))
  }

  // borrow incentives only: supply incentives are part of the effective APY
  const incentiveRows = (incentives: IncentiveApr[]) =>
    incentives.length
      ? [
          {
            label: t("summary.incentives"),
            content: (
              <Stack align="flex-end">
                {incentives.map((incentive) => (
                  <SummaryRowValue key={incentive.rewardTokenAddress}>
                    {t("common:percent", {
                      value: Number(incentive.rewardApr) * 100,
                      suffix: ` ${incentive.rewardTokenSymbol}`,
                    })}
                  </SummaryRowValue>
                ))}
              </Stack>
            ),
          },
        ]
      : []

  const actionButton = (action: "withdraw" | "repay") => (
    <Button
      iconStart={ACTION_ICONS[action]}
      variant="tertiary"
      size="small"
      onClick={() => setOpen({ action, asset })}
    >
      {t(action)}
    </Button>
  )

  return (
    <>
      {Big(supplied).gt(0) && (
        <PositionCard
          title={t("position.supplied")}
          logoId={logoId}
          amount={tokens(supplied)}
          amountUsd={usd(suppliedUsd)}
          action={actionButton("withdraw")}
          rows={[
            {
              label: t("summary.supplyApy"),
              content: <ApyCell rate={apy.supply} side="supply" />,
            },
            {
              label: t("position.earnings"),
              tooltip: t("position.earnings.tooltip"),
              content: yearly(suppliedUsd, apy.supply),
            },
            {
              label: t("position.poolShare"),
              content: percent(ratio(supplied, reserve.totalLiquidity)),
            },
            ...(canBeCollateral
              ? [
                  {
                    label: t("position.usedAsCollateral"),
                    content: (
                      <CollateralSwitch
                        row={{ reserve, position }}
                        onAction={(action, asset) => setOpen({ action, asset })}
                      />
                    ),
                  },
                  ...(position.usageAsCollateralEnabledOnUser
                    ? [
                        {
                          label: t("position.collateralShare"),
                          content: percent(
                            ratio(suppliedUsd, acc?.totalCollateralUsd ?? 0),
                          ),
                        },
                      ]
                    : []),
                  {
                    label: t("summary.maxLtv"),
                    content: percent(inEMode ? reserve.eModeLtv : reserve.ltv),
                  },
                  {
                    label: t("position.liquidationThreshold"),
                    content: percent(
                      inEMode
                        ? reserve.eModeLiquidationThreshold
                        : reserve.liquidationThreshold,
                    ),
                  },
                ]
              : []),
          ]}
        />
      )}
      {Big(borrowed).gt(0) && (
        <PositionCard
          title={t("position.borrowed")}
          logoId={logoId}
          amount={tokens(borrowed)}
          amountUsd={usd(borrowedUsd)}
          action={actionButton("repay")}
          rows={[
            {
              label: t("summary.borrowApy"),
              content: apy.borrow ? (
                <ApyCell rate={apy.borrow} side="borrow" />
              ) : (
                <NoData />
              ),
            },
            ...incentiveRows(reserve.borrowIncentives),
            {
              label: t("position.cost"),
              tooltip: t("position.cost.tooltip"),
              content: yearly(borrowedUsd, apy.borrow),
            },
            {
              label: t("position.debtShare"),
              content: percent(ratio(borrowedUsd, acc?.totalBorrowsUsd ?? 0)),
            },
          ]}
        />
      )}
      <OpenActionModal open={open} onClose={() => setOpen(null)} />
    </>
  )
}
