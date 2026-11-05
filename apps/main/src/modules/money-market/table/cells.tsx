import type {
  PositionSummary,
  ReserveSummary,
} from "@galacticcouncil/money-market/types"
import { Check, Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  AssetLabel,
  Button,
  Chip,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Icon,
  LogoSize,
  MenuItemLabel,
  MenuSelectionItem,
  Skeleton,
  Text,
  TextProps,
  Toggle,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { Address } from "viem"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { UnavailableApy } from "@/components/DetailedApy/UnavailableApy"
import { ApySide, ApyTooltip } from "@/modules/money-market/apy/ApyTooltip"
import { ApyRate, NetApyState } from "@/modules/money-market/apy/effectiveApy"
import { useReserveApy } from "@/modules/money-market/apy/ReserveApyProvider"
import { useReserveDisplay } from "@/modules/money-market/reserves/useReserveDisplay"

export type SuppliedRow = {
  reserve: ReserveSummary
  position: PositionSummary
}
export type SupplyRow = {
  reserve: ReserveSummary
  balance: string | undefined
  balanceUsd: string | undefined
  /** A swap-in reserve: supplied from any asset, whatever the wallet holds. */
  pinned?: boolean
}
export type BorrowRow = {
  reserve: ReserveSummary
  available: string
  availableUsd: string
}

export type RowAction =
  | "supply"
  | "withdraw"
  | "borrow"
  | "repay"
  | "collateral"

/** Opens an action on a row's reserve - absent while no wallet is connected. */
export type OnRowAction =
  | ((action: RowAction, asset: Address) => void)
  | undefined

export const ReserveAsset: FC<{
  reserve: ReserveSummary
  size?: LogoSize
}> = ({ reserve, size }) => {
  const { symbol, logoId } = useReserveDisplay(reserve)

  return (
    <AssetLabelFullContainer>
      <AssetLogo id={logoId} size={size} />
      <AssetLabel symbol={symbol} />
    </AssetLabelFullContainer>
  )
}

export const NoData = () => <Text color={getToken("text.low")}>—</Text>

type ApyTextProps = Omit<TextProps, "children">

/**
 * An effective APY: the total as the one headline figure, with its
 * parts in a tooltip unless the base rate is all there is. A rate that is not
 * known never shows a number. The figure is plain text that takes its size
 * from the parent, so it sits in a table cell or a summary row alike - any
 * `Text` prop overrides it.
 */
export const ApyCell: FC<ApyTextProps & { rate: ApyRate; side: ApySide }> = ({
  rate,
  side,
  ...textProps
}) => {
  const { t } = useTranslation()

  if (rate.status === "loading") return <Skeleton width="4em" />

  if (rate.status === "unavailable") {
    return (
      <Flex inline>
        <UnavailableApy />
      </Flex>
    )
  }

  const percent = (value: string) =>
    t("percent", { value: Big(value).times(100).toNumber() })

  const [first] = rate.parts
  const hasBreakdown = rate.parts.length > 1 || first?.kind !== "base"
  const incentiveAssetIds = rate.parts.flatMap(({ kind, assetId }) =>
    kind === "incentive" && assetId ? [assetId] : [],
  )

  return (
    <Flex inline gap="s" align="center">
      {incentiveAssetIds.length > 0 && (
        <AssetLogo size="extra-small" id={incentiveAssetIds} />
      )}
      <Text as="span" fw={500} color={getToken("text.high")} {...textProps}>
        {percent(rate.total)}
      </Text>
      {hasBreakdown && (
        <ApyTooltip parts={rate.parts} total={rate.total} side={side} />
      )}
    </Flex>
  )
}

/**
 * One side of a reserve's effective APY, resolved here because a column's
 * `cell` cannot read the context. A reserve with no borrow rate shows a dash.
 */
export const ReserveApyCell: FC<
  ApyTextProps & { reserve: ReserveSummary; side: ApySide }
> = ({ reserve, side, ...textProps }) => {
  const rate = useReserveApy(reserve)[side]

  if (!rate) return <NoData />

  return <ApyCell rate={rate} side={side} {...textProps} />
}

/**
 * One of an account's net, earned or debt APY. A figure that cannot be
 * trusted shows the warning, never a number; an account with no net worth has
 * no net APY, which is a dash and not a warning.
 */
export const NetApyValue: FC<{
  netApy: NetApyState
  figure: "netApy" | "earnedApy" | "debtApy"
}> = ({ netApy, figure }) => {
  const { t } = useTranslation()

  if (netApy.status === "loading") return <Skeleton width="4em" />

  const value = netApy[figure]

  if (value === null) {
    return figure === "netApy" && netApy.reason === "noNetWorth" ? (
      <NoData />
    ) : (
      <Flex inline>
        <UnavailableApy />
      </Flex>
    )
  }

  return t("percent", { value: Big(value).times(100).toNumber() })
}

/**
 * An amount and its USD value. On mobile it heads the row's card, so it
 * carries the asset too - and is just the asset while there is no amount.
 */
export const AmountCell: FC<{
  reserve: ReserveSummary
  amount: string | undefined
  usd: string | undefined
}> = ({ reserve, amount, usd }) => {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoints()
  const { symbol, logoId } = useReserveDisplay(reserve)

  if (!amount || !usd) {
    return isMobile ? <ReserveAsset reserve={reserve} /> : <NoData />
  }

  const value = t("number", { value: amount, subscript: true })
  const display = (
    <Amount
      value={isMobile ? `${value} ${symbol}` : value}
      displayValue={t("currency", { value: usd, maximumFractionDigits: 2 })}
    />
  )

  return isMobile ? (
    <Flex align="center" gap="base">
      <AssetLogo id={logoId} />
      {display}
    </Flex>
  ) : (
    display
  )
}

export const CollateralCell: FC<{ enabled: boolean; isolated: boolean }> = ({
  enabled,
  isolated,
}) => {
  if (!enabled) return <Text color={getToken("text.low")}>—</Text>
  if (isolated) {
    return (
      <Chip variant="amber" size="small">
        Isolated
      </Chip>
    )
  }

  return (
    <Icon
      display="inline-flex"
      color={getToken("accents.success.emphasis")}
      component={Check}
      size="m"
    />
  )
}

/** A supplied position's collateral flag; flipping it opens the collateral form. */
export const CollateralSwitch: FC<{
  row: SuppliedRow
  onAction: OnRowAction
}> = ({ row: { reserve, position }, onAction }) => (
  <Flex direction="column" align="center" gap="xs">
    <Toggle
      checked={position.usageAsCollateralEnabledOnUser}
      disabled={!onAction}
      onClick={(e) => e.stopPropagation()}
      onCheckedChange={() => onAction?.("collateral", reserve.underlyingAsset)}
    />
    {reserve.isIsolated && (
      <Chip variant="amber" size="small">
        Isolated
      </Chip>
    )}
  </Flex>
)

type ButtonAction = Exclude<RowAction, "collateral">

/**
 * A `tooltip` says why the row is disabled. It hangs off a wrapper, as a
 * disabled button fires no pointer events of its own. `more` actions sit
 * behind a "..." menu.
 */
export const ActionsCell: FC<{
  asset: Address
  actions: ButtonAction[]
  onAction: OnRowAction
  disabled?: boolean
  tooltip?: string
  more?: readonly ButtonAction[]
  size?: "small" | "medium"
}> = ({
  asset,
  actions,
  onAction,
  disabled,
  tooltip,
  more,
  size = "small",
}) => {
  const { t } = useTranslation(["borrow", "common"])

  return (
    <Flex justify="flex-end" gap="s">
      {actions.map((action) => (
        <Tooltip
          key={action}
          text={tooltip}
          size="small"
          side="top"
          asChild
          preventDefault
        >
          <Flex inline>
            <Button
              variant="muted"
              outline
              size="small"
              disabled={disabled || !onAction}
              onClick={(e) => {
                e.stopPropagation()
                onAction?.(action, asset)
              }}
            >
              {t(action)}
            </Button>
          </Flex>
        </Tooltip>
      ))}
      {more && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              icon={Ellipsis}
              variant="muted"
              outline
              size={size}
              aria-label={t("common:more")}
              disabled={disabled || !onAction}
              onClick={(e) => e.stopPropagation()}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" size={size}>
            {more.map((action) => (
              <DropdownMenuItem key={action} asChild>
                <MenuSelectionItem
                  variant="filterLink"
                  onClick={(e) => {
                    // the menu is portaled, yet its clicks still bubble to the row
                    e.stopPropagation()
                    onAction?.(action, asset)
                  }}
                >
                  <MenuItemLabel>{t(action)}</MenuItemLabel>
                </MenuSelectionItem>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Flex>
  )
}
