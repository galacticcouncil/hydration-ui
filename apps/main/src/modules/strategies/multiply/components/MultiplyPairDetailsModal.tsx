import { type ReserveSummary } from "@galacticcouncil/money-market/types"
import {
  Flex,
  Grid,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Paper,
  Stack,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Fragment } from "react"
import { useTranslation } from "react-i18next"

import { AddressTag } from "@/components/AddressTag/AddressTag"
import { AssetLogo } from "@/components/AssetLogo"
import { AppSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { ApyBreakdown } from "@/modules/money-market/apy/ApyTooltip"
import { type ApyRate } from "@/modules/money-market/apy/effectiveApy"
import { useResolveReserveApy } from "@/modules/money-market/apy/ReserveApyProvider"
import { HealthFactorNumber } from "@/modules/money-market/health-factor/HealthFactorNumber"
import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { apyColor } from "@/modules/strategies/multiply/components/MultiplyStat"
import {
  RiskBadge,
  RiskBadgeSkeleton,
} from "@/modules/strategies/multiply/components/RiskBadge"
import { LOOPER_FACTORY_ADDRESS } from "@/modules/strategies/multiply/config/pairs"
import {
  type MultiplyPairMetrics,
  type MultiplyPairRow,
} from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import {
  getCapRoom,
  getDeployHealthFactor,
  getMaxDeposit,
  getNetApy,
} from "@/modules/strategies/multiply/utils/projection"
import { getLiquidationBuffer } from "@/modules/strategies/multiply/utils/risk"

type MultiplyPairDetailsModalProps = {
  row: MultiplyPairRow | null
  onClose: () => void
}

export const MultiplyPairDetailsModal: React.FC<
  MultiplyPairDetailsModalProps
> = ({ row, onClose }) => {
  const { t } = useTranslation("strategies")
  const display = useResolveAssetDisplay()

  const collateral = row ? display(row.pair.collateralAssetId) : null
  const debt = row ? display(row.pair.debtAssetId) : null

  return (
    <Modal variant="popup" open={!!row} onOpenChange={onClose}>
      <ModalHeader
        title={
          collateral && debt
            ? t("multiply.pairDetails.title", {
                pair: `${collateral.symbol}/${debt.symbol}`,
              })
            : ""
        }
        customTitle={
          collateral &&
          debt && (
            <Flex align="center" gap="s">
              <AssetLogo id={[collateral.logoId, debt.logoId]} collapsed />
              <Stack gap="xs">
                <Text
                  font="primary"
                  fs="p3"
                  fw={500}
                  lh={1}
                  color={getToken("text.high")}
                >
                  {collateral.symbol}/{debt.symbol}
                </Text>
                <Text fs="p5" color={getToken("text.medium")} mt="-s">
                  {t("multiply.pairDetails.subtitle")}
                </Text>
              </Stack>
            </Flex>
          )
        }
      />
      <ModalBody>
        {row &&
          (row.data && row.collateralReserve && row.debtReserve ? (
            <PairDetails
              row={row}
              data={row.data}
              collateralReserve={row.collateralReserve}
              debtReserve={row.debtReserve}
            />
          ) : (
            <AppSkeleton />
          ))}
      </ModalBody>
    </Modal>
  )
}

const PairDetails: React.FC<{
  row: MultiplyPairRow
  data: MultiplyPairMetrics
  collateralReserve: ReserveSummary
  debtReserve: ReserveSummary
}> = ({ row, data, collateralReserve, debtReserve }) => {
  const { t } = useTranslation(["strategies", "common"])
  const display = useResolveAssetDisplay()
  const resolveApy = useResolveReserveApy()
  const { pair, risk } = row

  const collateral = display(pair.collateralAssetId).symbol
  const debt = display(pair.debtAssetId).symbol
  const percent = (value: number) => t("common:percent", { value: value * 100 })
  const leverageLabel = (value: number) =>
    t("cards.multiply.leverage", { value })

  const { lt, minHf, maxLeverage, supplyApy, borrowApy } = data
  const collateralPriceUsd = Number(collateralReserve.priceInUsd)
  const debtPriceUsd = Number(debtReserve.priceInUsd)
  const priceRatio = debtPriceUsd > 0 ? collateralPriceUsd / debtPriceUsd : 0
  const inEMode =
    pair.eMode !== 0 && collateralReserve.eModeCategoryId === pair.eMode

  const levels = [...new Set([2, 3, maxLeverage])]
    .filter((l) => l > 1 && l <= maxLeverage)
    .map((leverage) => {
      const hf = getDeployHealthFactor(lt, minHf, leverage)
      return {
        leverage,
        hf,
        netApy:
          supplyApy !== null && borrowApy !== null
            ? getNetApy(leverage, supplyApy, borrowApy)
            : null,
        liquidationRatio: priceRatio / hf,
        buffer: getLiquidationBuffer(hf),
      }
    })
  const atMax = levels.at(-1)

  const debtRooms = [
    getCapRoom(debtReserve.borrowCap, debtReserve.totalDebt),
    Number(data.availableLiquidity),
  ].filter((r) => r !== null)
  const debtRoom = debtRooms.length ? Math.min(...debtRooms) : null
  const supplyRoom = getCapRoom(
    collateralReserve.supplyCap,
    collateralReserve.totalLiquidity,
  )
  const maxDeposit =
    maxLeverage > 1
      ? getMaxDeposit({
          leverage: maxLeverage,
          collateralPriceUsd,
          debtPriceUsd,
          supplyRoom,
          debtRoom,
          ceilingRoomUsd: collateralReserve.isIsolated
            ? Number(collateralReserve.availableDebtCeilingUsd)
            : null,
        })
      : null

  const breakEven =
    borrowApy !== null && maxLeverage > 1
      ? ((maxLeverage - 1) / maxLeverage) * borrowApy
      : null

  const compact = (value: number | string, symbol?: string) =>
    t("common:currency.compact", { value, symbol })

  return (
    <Stack gap="xl" separated separator={<ModalContentDivider />}>
      <Section
        title={t("multiply.pairDetails.risk")}
        action={
          risk ? (
            <RiskBadge
              risk={risk}
              collateral={collateral}
              debt={debt}
              hf={data.maxLeverageHf}
            />
          ) : (
            <RiskBadgeSkeleton />
          )
        }
      >
        <Summary
          separator={<ModalContentDivider />}
          rows={[
            ...(atMax
              ? [
                  {
                    label: t("multiply.pairDetails.liquidatesBelow"),
                    tooltip: t("multiply.pairDetails.liquidatesBelowTooltip", {
                      collateral,
                      debt,
                      leverage: leverageLabel(atMax.leverage),
                    }),
                    content: t("multiply.pairDetails.ratio", {
                      collateral,
                      debt,
                      value: atMax.liquidationRatio,
                      drop: atMax.buffer * 100,
                    }),
                  },
                ]
              : []),
            {
              label: t("multiply.pairDetails.largestFall"),
              tooltip: t("multiply.pairDetails.largestFallTooltip", {
                collateral,
                debt,
              }),
              content:
                !risk || risk.largestFall === null
                  ? "—"
                  : percent(risk.largestFall),
            },
          ]}
        />
      </Section>

      {levels.length > 0 && (
        <Section title={t("multiply.pairDetails.byLeverage")}>
          <Grid
            columnTemplate="repeat(4, auto)"
            columnGap="m"
            rowGap="s"
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {[
              t("multiply.open.leverage"),
              t("multiply.open.netApy"),
              t("common:healthFactor"),
              t("multiply.pairDetails.toLiquidation"),
            ].map((label, i) => (
              <Text
                key={label}
                fs="p6"
                color={getToken("text.medium")}
                align={i ? "end" : "start"}
              >
                {label}
              </Text>
            ))}
            {levels.map((level) => (
              <Fragment key={level.leverage}>
                <Text fs="p5" fw={600}>
                  {leverageLabel(level.leverage)}
                </Text>
                <Text
                  fs="p5"
                  fw={600}
                  align="end"
                  color={apyColor(level.netApy)}
                >
                  {level.netApy === null ? "—" : percent(level.netApy)}
                </Text>
                <Text fs="p5" fw={600} align="end">
                  <HealthFactorNumber value={level.hf.toString()} />
                </Text>
                <Text fs="p5" fw={600} align="end">
                  {t("common:percent", {
                    prefix: "−",
                    value: level.buffer * 100,
                  })}
                </Text>
              </Fragment>
            ))}
          </Grid>
        </Section>
      )}

      <Section title={t("multiply.pairDetails.parameters")}>
        <Summary
          separator={<ModalContentDivider />}
          rows={[
            ...(inEMode
              ? [
                  {
                    label: t("multiply.custom.eMode"),
                    tooltip: t("multiply.pairDetails.eModeTooltip"),
                    content: collateralReserve.eModeLabel,
                  },
                ]
              : []),
            {
              label: t("multiply.pairDetails.maxLtv"),
              tooltip: t("multiply.pairDetails.maxLtvTooltip", { collateral }),
              content: percent(data.ltv),
            },
            {
              label: t("multiply.pairDetails.liquidationThreshold"),
              tooltip: t("multiply.pairDetails.liquidationThresholdTooltip"),
              content: percent(lt),
            },
            {
              label: t("multiply.pairDetails.penalty"),
              tooltip: t("multiply.pairDetails.penaltyTooltip"),
              content: percent(
                Number(
                  inEMode
                    ? collateralReserve.eModeLiquidationBonus
                    : collateralReserve.liquidationBonus,
                ),
              ),
            },
            {
              label: t("cards.multiply.maxLeverage"),
              content: leverageLabel(maxLeverage),
            },
            {
              label: t("multiply.pairDetails.minHf"),
              tooltip: t("multiply.pairDetails.minHfTooltip"),
              content: <HealthFactorNumber value={minHf.toString()} />,
            },
          ]}
        />
      </Section>

      <Section title={t("multiply.pairDetails.yield")}>
        <Grid columnTemplate={["1fr", "1fr 1fr"]} gap="m">
          <RateCard
            rate={resolveApy(collateralReserve).supply}
            side="supply"
            fallback={supplyApy}
          />
          <RateCard
            rate={resolveApy(debtReserve).borrow}
            side="borrow"
            fallback={borrowApy}
          />
        </Grid>
        {breakEven !== null && (
          <Summary
            separator={<ModalContentDivider />}
            rows={[
              {
                label: t("multiply.pairDetails.breakEven"),
                tooltip: t("multiply.pairDetails.breakEvenTooltip", {
                  collateral,
                  leverage: leverageLabel(maxLeverage),
                }),
                content: percent(breakEven),
              },
            ]}
          />
        )}
      </Section>

      <Section title={t("multiply.pairDetails.capacity")}>
        <Summary
          separator={<ModalContentDivider />}
          rows={[
            {
              label: t("multiply.pairDetails.maxDeposit"),
              tooltip: t("multiply.pairDetails.maxDepositTooltip", {
                leverage: leverageLabel(maxLeverage),
              }),
              content:
                maxDeposit === null
                  ? t("multiply.pairDetails.noLimit")
                  : compact(maxDeposit, collateral),
            },
            {
              label: t("multiply.pairDetails.supplyRoom", { collateral }),
              content:
                supplyRoom === null
                  ? t("multiply.pairDetails.noLimit")
                  : compact(Math.max(0, supplyRoom), collateral),
            },
            {
              label: t("multiply.pairDetails.borrowRoom", { debt }),
              content:
                debtRoom === null
                  ? t("multiply.pairDetails.noLimit")
                  : compact(Math.max(0, debtRoom), debt),
            },
            ...(collateralReserve.isIsolated
              ? [
                  {
                    label: t("multiply.pairDetails.ceilingRoom"),
                    tooltip: t("multiply.pairDetails.ceilingRoomTooltip", {
                      collateral,
                    }),
                    content: t("multiply.pairDetails.ofTotal", {
                      value: compact(collateralReserve.availableDebtCeilingUsd),
                      total: compact(collateralReserve.debtCeilingUsd),
                    }),
                  },
                ]
              : []),
          ]}
        />
      </Section>

      <Section title={t("multiply.pairDetails.howItWorks")}>
        <Text fs="p5" color={getToken("text.medium")}>
          {t("multiply.pairDetails.howItWorksText", { collateral, debt })}
        </Text>
      </Section>

      <Section title={t("multiply.pairDetails.contracts")}>
        <Summary
          separator={<ModalContentDivider />}
          rows={[
            {
              label: t("multiply.pairDetails.aToken", { collateral }),
              content: <Address value={pair.aCollateral} />,
            },
            {
              label: t("multiply.pairDetails.debtToken", { debt }),
              content: <Address value={pair.variableDebt} />,
            },
            ...(LOOPER_FACTORY_ADDRESS
              ? [
                  {
                    label: t("multiply.pairDetails.factory"),
                    content: <Address value={LOOPER_FACTORY_ADDRESS} />,
                  },
                ]
              : []),
          ]}
        />
      </Section>
    </Stack>
  )
}

const Section: React.FC<{
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}> = ({ title, action, children }) => (
  <Stack gap="s">
    <Flex align="center" justify="space-between" gap="m">
      <Text font="primary" fs="p3" fw={600} color={getToken("text.high")}>
        {title}
      </Text>
      {action}
    </Flex>
    {children}
  </Stack>
)

const RateCard: React.FC<{
  rate: ApyRate | undefined
  side: "supply" | "borrow"
  fallback: number | null
}> = ({ rate, side, fallback }) => {
  const { t } = useTranslation()
  return (
    <Paper p="m" shadow={false}>
      {rate?.status === "known" ? (
        <ApyBreakdown
          parts={rate.parts}
          total={rate.total}
          side={side}
          hideDescription
        />
      ) : (
        <Stack gap="xs">
          <Text fs="p6" color={getToken("text.medium")}>
            {t(side === "supply" ? "supplyApy" : "borrowApy")}
          </Text>
          <Text fs="p4" fw={600}>
            {fallback === null ? "—" : t("percent", { value: fallback * 100 })}
          </Text>
        </Stack>
      )}
    </Paper>
  )
}

const Address: React.FC<{ value: string }> = ({ value }) => (
  <AddressTag address={value} linkType="contract" fs="p5" />
)
