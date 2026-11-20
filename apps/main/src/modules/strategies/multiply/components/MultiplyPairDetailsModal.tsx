import { type ReserveSummary } from "@galacticcouncil/money-market/types"
import {
  Amount,
  Box,
  Chip,
  Flex,
  Grid,
  Icon,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Paper,
  Separator,
  Stack,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { ChevronRight, Repeat, RotateCw } from "lucide-react"
import { Fragment } from "react"
import { Trans, useTranslation } from "react-i18next"

import { AddressTag } from "@/components/AddressTag/AddressTag"
import { AssetLogo } from "@/components/AssetLogo"
import { useAssetColor } from "@/hooks/useAssetColor"
import { AppSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { type ApyRate } from "@/modules/money-market/apy/effectiveApy"
import { useResolveReserveApy } from "@/modules/money-market/apy/ReserveApyProvider"
import { HealthFactorNumber } from "@/modules/money-market/health-factor/HealthFactorNumber"
import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { apyColor } from "@/modules/strategies/multiply/components/MultiplyStat"
import { PairRiskIndicator } from "@/modules/strategies/multiply/components/PairRiskIndicator"
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

  return (
    <Modal variant="popup" open={!!row} onOpenChange={onClose}>
      <ModalHeader title={t("multiply.pairDetails.subtitle")} />
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

  const compact = (value: number | string, symbol?: string) =>
    t("common:currency.compact", { value, symbol })
  // null means the reserve sets no cap
  const withUsd = (value: number | null, symbol: string, priceUsd: number) => (
    <Amount
      value={
        value === null
          ? t("multiply.pairDetails.noLimit")
          : compact(Math.max(0, value), symbol)
      }
      displayValue={
        value === null ? undefined : compact(Math.max(0, value) * priceUsd)
      }
      sx={{ textAlign: "right" }}
    />
  )

  return (
    <Stack gap="xl">
      <Paper bg="mid" variant="plain" shadow={false}>
        <Flex align="center" justify="space-between" gap="m" wrap p="l">
          <Flex align="center" gap="l" wrap>
            <PairSide
              assetId={pair.collateralAssetId}
              label={t("multiply.pairDetails.collateralLabel", {
                symbol: collateral,
              })}
            />
            <PairSide
              assetId={pair.debtAssetId}
              label={t("multiply.pairDetails.debtLabel", { symbol: debt })}
            />
          </Flex>
          <PairRiskIndicator
            risk={risk ?? null}
            collateral={collateral}
            debt={debt}
            hf={data.maxLeverageHf}
            withLabel
          />
        </Flex>
        <Separator />
        <Grid columnTemplate={["1fr", "1fr auto 1fr"]}>
          <RateCard
            assetId={pair.collateralAssetId}
            rate={resolveApy(collateralReserve).supply}
            side="supply"
            fallback={supplyApy}
          />
          <Separator orientation={["horizontal", "vertical"]} />
          <RateCard
            assetId={pair.debtAssetId}
            rate={resolveApy(debtReserve).borrow}
            side="borrow"
            fallback={borrowApy}
          />
        </Grid>
      </Paper>
      <ModalContentDivider />
      <Section title={t("multiply.pairDetails.howItWorks")}>
        <Stack gap="l">
          <HowItWorks
            collateralAssetId={pair.collateralAssetId}
            debtAssetId={pair.debtAssetId}
          />
          <Text fs="p5" color={getToken("text.medium")}>
            {t("multiply.pairDetails.howItWorksText", { collateral, debt })}
          </Text>
        </Stack>
      </Section>
      <ModalContentDivider />
      <Section title={t("multiply.pairDetails.capacity")}>
        <Summary
          mb="-base"
          separator={<ModalContentDivider />}
          rows={[
            {
              label: t("multiply.pairDetails.maxDeposit"),
              tooltip: t("multiply.pairDetails.maxDepositTooltip", {
                leverage: leverageLabel(maxLeverage),
              }),
              content: withUsd(maxDeposit, collateral, collateralPriceUsd),
            },
            {
              label: t("multiply.pairDetails.supplyRoom", { collateral }),
              content: withUsd(supplyRoom, collateral, collateralPriceUsd),
            },
            {
              label: t("multiply.pairDetails.borrowRoom", { debt }),
              content: withUsd(debtRoom, debt, debtPriceUsd),
            },
            ...(collateralReserve.isIsolated
              ? [
                  {
                    label: t("multiply.pairDetails.ceilingRoom"),
                    tooltip: t("multiply.pairDetails.ceilingRoomTooltip", {
                      collateral,
                    }),
                    content: (
                      <Amount
                        value={t("multiply.pairDetails.ofTotal", {
                          value: compact(
                            collateralReserve.availableDebtCeilingUsd,
                          ),
                          total: compact(collateralReserve.debtCeilingUsd),
                        })}
                        sx={{ textAlign: "right" }}
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Section>
      <ModalContentDivider />
      <Section title={t("multiply.pairDetails.risk")}>
        <Summary
          mb="-base"
          separator={<ModalContentDivider />}
          rows={[
            {
              label: t("multiply.pairDetails.riskLevel"),
              content: (
                <PairRiskIndicator
                  risk={risk ?? null}
                  collateral={collateral}
                  debt={debt}
                  hf={data.maxLeverageHf}
                  withLabel
                />
              ),
            },
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
        <>
          <ModalContentDivider />
          <Section title={t("multiply.pairDetails.byLeverage")}>
            <Grid
              columnTemplate="repeat(4, auto)"
              columnGap="m"
              rowGap="m"
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
                  <Separator sx={{ gridColumn: "1 / -1" }} />
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
            <Flex align="center" gap="s" mt="l" color={getToken("text.medium")}>
              <Icon component={Repeat} size="s" />
              <Text fs="p6">{t("multiply.pairDetails.leverageNote")}</Text>
            </Flex>
          </Section>
        </>
      )}

      <ModalContentDivider />
      <Section title={t("multiply.pairDetails.parameters")}>
        <Summary
          mb="-base"
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

      <ModalContentDivider />
      <Section title={t("multiply.pairDetails.contracts")}>
        <Summary
          mb="-base"
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
  children: React.ReactNode
}> = ({ title, children }) => (
  <Box>
    <Text font="primary" fs="p3" mb="l" fw={600} color={getToken("text.high")}>
      {title}
    </Text>
    {children}
  </Box>
)

const PairSide: React.FC<{ assetId: string; label: string }> = ({
  assetId,
  label,
}) => {
  const asset = useResolveAssetDisplay()(assetId)
  return (
    <Flex align="center" gap="s">
      <AssetLogo id={asset.logoId} size="small" />
      <Text fs="p4" fw={500} color={getToken("text.high")}>
        {label}
      </Text>
    </Flex>
  )
}

const RateCard: React.FC<{
  assetId: string
  rate: ApyRate | undefined
  side: "supply" | "borrow"
  fallback: number | null
}> = ({ assetId, rate, side, fallback }) => {
  const { t } = useTranslation(["common", "strategies"])
  const asset = useResolveAssetDisplay()(assetId)
  const total = rate?.status === "known" ? Number(rate.total) : fallback
  const parts = rate?.status === "known" ? rate.parts : []

  return (
    <Stack gap="base" p="l" justify="flex-start">
      <Flex align="center" gap="s">
        <AssetLogo id={asset.logoId} size="small" />
        <Text fs="p4" fw={500} color={getToken("text.high")}>
          {asset.symbol}
        </Text>
      </Flex>
      <Stack gap="xs">
        <Text fs="p6" color={getToken("text.medium")}>
          {t(side === "supply" ? "supplyApy" : "borrowApy")}
        </Text>
        <Text font="primary" fs="h5" fw={500} lh={1} color={apyColor(total)}>
          {total === null ? "—" : t("percent", { value: total * 100 })}
        </Text>
      </Stack>
      {parts.length > 1 && (
        <Text fs="p6" color={getToken("text.high")}>
          {parts
            .map((part) =>
              t("strategies:multiply.pairDetails.apyPartValue", {
                value: Number(part.rate) * 100,
                label: t(
                  `strategies:multiply.pairDetails.apyPart.${part.kind === "base" ? side : part.kind}`,
                ),
              }),
            )
            .join(" + ")}
        </Text>
      )}
    </Stack>
  )
}

const HowItWorks: React.FC<{
  collateralAssetId: string
  debtAssetId: string
}> = ({ collateralAssetId, debtAssetId }) => {
  const { t } = useTranslation("strategies")
  const display = useResolveAssetDisplay()
  const getAssetColor = useAssetColor()
  const collateral = display(collateralAssetId)
  const debt = display(debtAssetId)

  const steps = [
    {
      key: "supply" as const,
      icon: <AssetLogo id={collateral.logoId} size="small" collapsed />,
    },
    {
      key: "borrow" as const,
      icon: <AssetLogo id={debt.logoId} size="small" collapsed />,
    },
    {
      key: "repeat" as const,
      icon: (
        <Icon
          component={RotateCw}
          size="m"
          color={getToken("accents.info.onPrimary")}
        />
      ),
    },
  ]

  return (
    <Stack gap="l" align="center">
      <Grid columnTemplate="repeat(3, 1fr)" width="100%">
        {steps.map(({ key, icon }, i) => (
          <Stack key={key} gap="s" align="center">
            <Flex align="center" width="100%" color={getToken("text.low")}>
              <Separator
                flex={1}
                sx={{ visibility: i ? "visible" : "hidden" }}
              />
              <Icon
                component={ChevronRight}
                size="s"
                ml="-s"
                sx={{ visibility: i ? "visible" : "hidden" }}
              />
              <Flex
                align="center"
                justify="center"
                size={pxToRem(40)}
                mx="s"
                borderRadius="full"
                bg={getToken("controls.dim.base")}
                flexShrink={0}
              >
                {icon}
              </Flex>
              <Separator
                flex={1}
                mr="s"
                sx={{ visibility: i < steps.length - 1 ? "visible" : "hidden" }}
              />
            </Flex>
            <Text fs="p4" fw={600} color={getToken("text.high")}>
              {t(`multiply.pairDetails.step.${key}`)}
            </Text>
            <Text fs="p5" align="center" color={getToken("text.medium")}>
              <Trans
                t={t}
                i18nKey={`multiply.pairDetails.step.${key}Text`}
                values={{ collateral: collateral.symbol, debt: debt.symbol }}
                components={[
                  <Text
                    key="collateral"
                    as="span"
                    fw={500}
                    color={getAssetColor(collateralAssetId)}
                  />,
                  <Text
                    key="debt"
                    as="span"
                    fw={500}
                    color={getAssetColor(debtAssetId)}
                  />,
                ]}
              />
            </Text>
          </Stack>
        ))}
      </Grid>
      <Chip
        variant="tertiary"
        size="small"
        rounded
        sx={{ bg: getToken("surfaces.containers.dim.dimOnHigh") }}
      >
        <Flex align="center" gap="xs">
          <Icon component={RotateCw} size="xs" />
          {t("multiply.pairDetails.repeatsUntil")}
        </Flex>
      </Chip>
    </Stack>
  )
}

const Address: React.FC<{ value: string }> = ({ value }) => (
  <AddressTag address={value} linkType="contract" fs="p5" />
)
