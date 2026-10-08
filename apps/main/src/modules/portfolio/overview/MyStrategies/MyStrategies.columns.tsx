import { HandCoins, TrendingUp } from "@galacticcouncil/ui/assets/icons"
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
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { LINKS } from "@/config/navigation"
import { StrategyPosition } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"
import { JuicerStrategyLogo } from "@/modules/strategies/propeller/components/JuicerStrategyLogo"
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

export const StrategyPositionLabel = ({
  position,
}: {
  position: StrategyPosition
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

export const StrategyPositionValue = ({
  position,
  withLabel = false,
}: {
  position: StrategyPosition
  withLabel?: boolean
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
                symbol: isJuicer ? position.symbol : position.shareSymbol,
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

export const StrategyPositionRate = ({
  position,
  withLabel = false,
  compact = false,
  horizontalLabel = false,
}: {
  position: StrategyPosition
  withLabel?: boolean
  compact?: boolean
  horizontalLabel?: boolean
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

export const StrategyPositionEarnings = ({
  position,
  withLabel = false,
  compact = false,
  horizontalLabel = false,
}: {
  position: StrategyPosition
  withLabel?: boolean
  compact?: boolean
  horizontalLabel?: boolean
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const value =
    position.rewards === null
      ? "—"
      : t("common:currency", {
          value: position.rewards,
          symbol: position.symbol,
        })

  if (compact) {
    return (
      <Text fs="p6" color={getToken("text.medium")}>
        {t("myStrategies.header.claimable")}: {value}
      </Text>
    )
  }

  return (
    <Amount
      variant={horizontalLabel ? "horizontalLabel" : "default"}
      label={withLabel ? t("myStrategies.header.earnings") : undefined}
      labelIcon={horizontalLabel ? HandCoins : undefined}
      value={value}
    />
  )
}

export const StrategyManageAction = ({
  position,
  mobile = false,
}: {
  position: StrategyPosition
  mobile?: boolean
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

export const StrategyPositionActions = ({
  position,
  mobile = false,
  onTransfer,
}: {
  position: StrategyPosition
  mobile?: boolean
  onTransfer?: (position: StrategyPosition) => void
}) => {
  const { t } = useTranslation("common")
  const canSend = position.shareAmount !== "0"

  return (
    <Flex gap="base" justify="flex-end" direction={mobile ? "column" : "row"}>
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
    <Skeleton circle width="2rem" height="2rem" />
    <Flex direction="column" gap="xs">
      <Skeleton width="7rem" height="1rem" />
      <Skeleton width="4rem" height="0.875rem" />
    </Flex>
  </Flex>
)

const AmountSkeletonCell = () => (
  <Flex direction="column" gap="xs">
    <Skeleton width="6rem" height="1rem" />
    <Skeleton width="4rem" height="0.875rem" />
  </Flex>
)

const ActionSkeletonCell = () => (
  <Flex justify="flex-end">
    <Skeleton width="5rem" height="1.875rem" borderRadius="9999px" />
  </Flex>
)

export const useMyStrategiesColumns = (
  onTransfer?: (position: StrategyPosition) => void,
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
      cell: ({ row }) => (
        <StrategyPositionActions
          position={row.original}
          onTransfer={onTransfer}
        />
      ),
    })

    return (
      isMobile ? [strategy, value] : [strategy, value, rate, earnings, actions]
    ) as ColumnDef<StrategyPosition>[]
  }, [isMobile, onTransfer, onDetails, t])
}
