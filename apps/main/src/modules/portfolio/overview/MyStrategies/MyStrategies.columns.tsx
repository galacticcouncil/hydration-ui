import { Clock3, TrendingUp } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  AssetLabel,
  Button,
  Chip,
  Flex,
  Skeleton,
  TableRowAction,
  TableRowDetailsExpand,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { BIL_ASSET_ID, BIL_ERC20_ID } from "@galacticcouncil/utils"
import { Link } from "@tanstack/react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { LINKS } from "@/config/navigation"
import { JuicerAssetCta } from "@/modules/portfolio/overview/MyAssets/JuicerAssetCta"
import {
  StrategyPosition,
  useMyJuicerPositions,
} from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"
import { JuicerStrategyLogo } from "@/modules/strategies/juicer/components/JuicerStrategyLogo"
import {
  JUICER_VAULTS,
  juicerPositionId,
  vaultByPositionId,
  vaultByShareAssetId,
} from "@/modules/strategies/juicer/config/vaults"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  naturally,
  nullLast,
  numerically,
  numericallyStr,
  sortBy,
} from "@/utils/sort"

export enum MyStrategiesColumnId {
  Strategy = "strategy",
  Value = "value",
  Rate = "rate",
  Earnings = "earnings",
  Actions = "actions",
}

const columnHelper = createColumnHelper<StrategyPosition>()

type StrategyLabelPosition = Pick<
  StrategyPosition,
  "assetId" | "symbol" | "strategy"
>

// Share token registry id → the asset and strategy its label shows.
const STRATEGY_SHARE_ASSETS: Record<
  string,
  Omit<StrategyLabelPosition, "symbol">
> = {
  [BIL_ASSET_ID]: { assetId: BIL_ERC20_ID, strategy: "bil" },
  ...Object.fromEntries(
    JUICER_VAULTS.map((vault) => [
      vault.shareAssetId,
      { assetId: vault.assetId, strategy: "juicer" },
    ]),
  ),
}

export const isStrategyShareAsset = (assetId: string) =>
  assetId in STRATEGY_SHARE_ASSETS

/** Label of a strategy share token held in the wallet (jETH → ETH, uBIL → BIL). */
type StrategyShareAssetLabelProps = { assetId: string }

export const StrategyShareAssetLabel: FC<StrategyShareAssetLabelProps> = ({
  assetId,
}) => {
  const { getAssetWithFallback } = useAssets()
  const share = STRATEGY_SHARE_ASSETS[assetId]
  if (!share) return null

  return (
    <StrategyPositionLabel
      position={{
        ...share,
        symbol: getAssetWithFallback(share.assetId).symbol,
      }}
    />
  )
}

type StrategyPositionLabelProps = {
  position: StrategyLabelPosition
}

export const StrategyPositionLabel: FC<StrategyPositionLabelProps> = ({
  position,
}) => {
  const { t } = useTranslation("wallet")

  return (
    <AssetLabelFullContainer>
      <AssetLogo id={position.assetId} />
      <AssetLabel
        symbol={position.symbol}
        badge={
          <Chip
            variant={position.strategy === "juicer" ? "amber" : "blue"}
            size="extra-small"
            rounded
          >
            {position.strategy === "juicer" ? (
              <>
                <JuicerStrategyLogo size="extra-small" />
                Juicer
              </>
            ) : (
              t("myStrategies.header.strategy")
            )}
          </Chip>
        }
      />
    </AssetLabelFullContainer>
  )
}

type StrategyPositionValueProps = {
  position: StrategyPosition
  withLabel?: boolean
}

export const StrategyPositionValue: FC<StrategyPositionValueProps> = ({
  position,
  withLabel = false,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const hasActiveShares =
    position.strategy !== "juicer" || position.shareAmount !== "0"
  const isJuicer = position.strategy === "juicer"
  const amount = isJuicer ? position.underlyingAmount : position.shareAmount

  return (
    <Amount
      label={withLabel ? t("myStrategies.header.value") : undefined}
      value={
        !hasActiveShares || amount === null
          ? "—"
          : `${isJuicer ? `${t("common:approx.short")} ` : ""}${t(
              "common:currency",
              {
                value: amount,
                symbol: isJuicer
                  ? position.underlyingSymbol
                  : position.shareSymbol,
              },
            )}`
      }
      displayValue={
        !hasActiveShares
          ? undefined
          : position.value === null
            ? "—"
            : t("common:currency", { value: position.value })
      }
    />
  )
}

type StrategyPositionRateProps = {
  position: StrategyPosition
  withLabel?: boolean
  compact?: boolean
  horizontalLabel?: boolean
}

export const StrategyPositionRate: FC<StrategyPositionRateProps> = ({
  position,
  withLabel = false,
  compact = false,
  horizontalLabel = false,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const value =
    position.rate === null ||
    (position.strategy === "juicer" && position.shareAmount === "0")
      ? "—"
      : `${t("common:percent", { value: position.rate })} ${t(
          position.rateKind === "apy" ? "common:apy" : "common:apr",
        )}`

  if (compact) {
    return (
      <Text fs="p6" color={getToken("text.medium")}>
        {t("myStrategies.header.rate")}: {value}
      </Text>
    )
  }

  return (
    <Amount
      variant={horizontalLabel ? "horizontalLabel" : "default"}
      label={withLabel ? t("myStrategies.header.rate") : undefined}
      labelIcon={horizontalLabel ? TrendingUp : undefined}
      value={value}
    />
  )
}

type StrategyPositionEarningsProps = {
  position: StrategyPosition
  withLabel?: boolean
  compact?: boolean
  horizontalLabel?: boolean
}

export const StrategyPositionEarnings: FC<StrategyPositionEarningsProps> = ({
  position,
  withLabel = false,
  compact = false,
  horizontalLabel = false,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const value =
    position.pendingEarnings === null
      ? "—"
      : t("common:currency", {
          value: position.pendingEarnings,
          symbol: position.underlyingSymbol,
          maximumFractionDigits: 6,
        })

  if (compact) {
    return (
      <Text fs="p6" color={getToken("text.medium")}>
        {t("myStrategies.header.earnings")}: {value}
      </Text>
    )
  }

  return (
    <Amount
      variant={horizontalLabel ? "horizontalLabel" : "default"}
      label={withLabel ? t("myStrategies.header.earnings") : undefined}
      labelIcon={horizontalLabel ? Clock3 : undefined}
      value={value}
    />
  )
}

type StrategyManageActionProps = {
  position: StrategyPosition
  mobile?: boolean
}

export const StrategyManageAction: FC<StrategyManageActionProps> = ({
  position,
  mobile = false,
}) => {
  const { t } = useTranslation("common")
  const link =
    position.strategy === "juicer" ? (
      <Link to={LINKS.strategiesJuicer} search={{ asset: position.symbol }}>
        {t("manage")}
      </Link>
    ) : (
      <Link to={LINKS.strategiesBil}>{t("manage")}</Link>
    )

  return mobile ? (
    <Button variant="primary" size="large" asChild>
      {link}
    </Button>
  ) : (
    <TableRowAction asChild>{link}</TableRowAction>
  )
}

type StrategyPositionCtaProps = {
  position: StrategyPosition
  mobile?: boolean
}

export const StrategyPositionCta: FC<StrategyPositionCtaProps> = ({
  position,
  mobile = false,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const size = mobile ? "large" : undefined
  const link = {
    to: LINKS.strategiesJuicer,
    search: { asset: position.symbol },
  }

  if (position.action === "claim") {
    return (
      <Button variant="emphasis" outline size={size} asChild>
        <Link {...link} search={{ ...link.search, section: "withdrawals" }}>
          {t("common:claim")}
        </Link>
      </Button>
    )
  }

  if (position.action === "deposit") {
    return (
      <JuicerAssetCta
        assetId={position.assetId}
        // the position's assetId is its display asset (ETH), not the
        // collateral, so name the vault rather than look it up by asset
        vault={vaultByPositionId(position.id)}
        mobile={mobile}
        isExistingPosition
      />
    )
  }

  return null
}

const JuicerShareAssetCta = ({ assetId }: { assetId: string }) => {
  const vault = vaultByShareAssetId(assetId)
  const position = useMyJuicerPositions().data.find(
    (position) => !!vault && position.id === juicerPositionId(vault),
  )

  // A ready claim is promoted on the strategy row, not on the share token.
  return position?.action === "deposit" ? (
    <StrategyPositionCta position={position} />
  ) : null
}

/** Deposit CTA for a Juicer share token held in the wallet. */
type StrategyShareAssetCtaProps = { assetId: string }

export const StrategyShareAssetCta: FC<StrategyShareAssetCtaProps> = ({
  assetId,
}) => {
  const { featureFlags, isReady } = useRpcProvider()
  const isJuicer = STRATEGY_SHARE_ASSETS[assetId]?.strategy === "juicer"

  // Mount the vault reads only where Juicer is enabled.
  return isJuicer && isReady && featureFlags.juicerEnabled ? (
    <JuicerShareAssetCta assetId={assetId} />
  ) : null
}

type StrategyPositionActionsProps = {
  position: StrategyPosition
  mobile?: boolean
  onTransfer?: (position: StrategyPosition) => void
}

export const StrategyPositionActions: FC<StrategyPositionActionsProps> = ({
  position,
  mobile = false,
  onTransfer,
}) => {
  const { t } = useTranslation("common")
  const canSend = position.shareAmount !== "0"

  return (
    <Flex gap="base" justify="flex-end" direction={mobile ? "column" : "row"}>
      <StrategyPositionCta position={position} mobile={mobile} />
      {onTransfer &&
        (mobile ? (
          <Button
            variant="secondary"
            size="large"
            disabled={!canSend}
            onClick={() => onTransfer(position)}
          >
            {t("send")}
          </Button>
        ) : (
          <TableRowAction
            disabled={!canSend}
            onClick={() => onTransfer(position)}
          >
            {t("send")}
          </TableRowAction>
        ))}
      <StrategyManageAction position={position} mobile={mobile} />
    </Flex>
  )
}

const AssetSkeletonCell = () => (
  <Flex align="center" gap="base">
    <Skeleton circle width={pxToRem(32)} height={pxToRem(32)} />
    <Flex direction="column" gap="xs">
      <Skeleton width={pxToRem(112)} height={pxToRem(16)} />
      <Skeleton width={pxToRem(64)} height={pxToRem(14)} />
    </Flex>
  </Flex>
)

const AmountSkeletonCell = () => (
  <Flex direction="column" gap="xs">
    <Skeleton width={pxToRem(96)} height={pxToRem(16)} />
    <Skeleton width={pxToRem(64)} height={pxToRem(14)} />
  </Flex>
)

const ActionSkeletonCell = () => {
  const { themeProps } = useTheme()
  return (
    <Flex justify="flex-end">
      <Skeleton
        width={pxToRem(80)}
        height={pxToRem(30)}
        borderRadius={themeProps.radii.full}
      />
    </Flex>
  )
}

export const useMyStrategiesColumns = (
  onDetails?: (position: StrategyPosition) => void,
) => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const strategy = columnHelper.accessor("symbol", {
      id: MyStrategiesColumnId.Strategy,
      header: t("myStrategies.header.strategy"),
      meta: { skeletonCell: AssetSkeletonCell },
      sortingFn: sortBy({
        select: (row) => row.original.symbol,
        compare: naturally,
      }),
      cell: ({ row }) => <StrategyPositionLabel position={row.original} />,
    })

    const value = columnHelper.accessor("value", {
      id: MyStrategiesColumnId.Value,
      header: t("myStrategies.header.value"),
      meta: { skeletonCell: AmountSkeletonCell },
      sortingFn: sortBy({
        select: (row) => row.original.value ?? "0",
        compare: numericallyStr,
      }),
      cell: ({ row }) => {
        const amount = <StrategyPositionValue position={row.original} />
        return isMobile ? (
          <TableRowDetailsExpand
            aria-label={t("common:details")}
            onClick={() => onDetails?.(row.original)}
          >
            <Flex direction="column" gap="base" align="flex-end">
              {amount}
              <Flex direction="column" gap="xs" align="flex-end">
                <StrategyPositionRate position={row.original} compact />
                <StrategyPositionEarnings position={row.original} compact />
              </Flex>
            </Flex>
          </TableRowDetailsExpand>
        ) : (
          amount
        )
      },
    })

    const rate = columnHelper.accessor("rate", {
      id: MyStrategiesColumnId.Rate,
      header: () => (
        <Tooltip text={t("myStrategies.rate.note")} asChild>
          <span tabIndex={0}>{t("myStrategies.header.rate")}</span>
        </Tooltip>
      ),
      meta: { skeletonCell: AmountSkeletonCell },
      sortingFn: sortBy({
        select: (row) => row.original.rate,
        compare: nullLast(numerically),
      }),
      cell: ({ row }) => <StrategyPositionRate position={row.original} />,
    })

    const earnings = columnHelper.display({
      id: MyStrategiesColumnId.Earnings,
      header: () => (
        <Tooltip text={t("myStrategies.earnings.note")} asChild>
          <span tabIndex={0}>{t("myStrategies.header.earnings")}</span>
        </Tooltip>
      ),
      meta: { skeletonCell: AmountSkeletonCell },
      cell: ({ row }) => <StrategyPositionEarnings position={row.original} />,
    })

    const actions = columnHelper.display({
      id: MyStrategiesColumnId.Actions,
      header: t("common:actions"),
      meta: {
        sx: { textAlign: "right" },
        skeletonCell: ActionSkeletonCell,
      },
      cell: ({ row }) => <StrategyPositionActions position={row.original} />,
    })

    return (
      isMobile ? [strategy, value] : [strategy, value, rate, earnings, actions]
    ) as ColumnDef<StrategyPosition>[]
  }, [isMobile, onDetails, t])
}
