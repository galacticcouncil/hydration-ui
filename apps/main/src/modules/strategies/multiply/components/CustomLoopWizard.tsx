import {
  Alert,
  AssetLabel,
  Box,
  Button,
  Collapsible,
  Flex,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Paper,
  ScrollArea,
  Separator,
  Stack,
  Summary,
  SummaryRowValue,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  ValueStats,
  ValueStatsGroup,
  WizardStep,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Fragment, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { MultiplyOptionRow } from "@/modules/strategies/multiply/components/MultiplyOptionRow"
import { SOptionTable } from "@/modules/strategies/multiply/components/MultiplyOptionRow.styled"
import { apyColor } from "@/modules/strategies/multiply/components/MultiplyStat"
import { PairRiskIndicator } from "@/modules/strategies/multiply/components/PairRiskIndicator"
import {
  findPairByAssets,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
import {
  useCustomLoopsStore,
  useMultiplyPairs,
} from "@/modules/strategies/multiply/hooks/useCustomLoops"
import { useLoopFillHints } from "@/modules/strategies/multiply/hooks/useLoopFills"
import {
  type MultiplyPairRow,
  useLoopCandidates,
} from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import {
  sortDebtLoops,
  summarizeCollaterals,
} from "@/modules/strategies/multiply/utils/loops"
import { useLooperSettings } from "@/states/looperSettings"

type Candidate = MultiplyPairRow & {
  collateralAssetId: string
  maxNetApy: number | null
  unavailable: boolean
  reason: string | null
  fills: { fillsUpTo: number; unwindFills: boolean } | undefined
  existing: MultiplyPair | undefined
}

type CustomLoopWizardProps = {
  onClose: () => void
  onSelect: (pair: MultiplyPair) => void
}

export const CustomLoopWizard: React.FC<CustomLoopWizardProps> = ({
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const slippage = useLooperSettings((s) => s.slippage)
  const display = useResolveAssetDisplay()
  const rows = useLoopCandidates()
  const pairs = useMultiplyPairs()
  const add = useCustomLoopsStore((s) => s.add)

  const [step, setStep] = useState(0)
  const [collateralId, setCollateralId] = useState<string | null>(null)
  const [pickSlug, setPickSlug] = useState<string | null>(null)

  const symbol = (id: string) => display(id).symbol

  // ponytail: quotes only the loop under review (8 router quotes); rows can't
  // show "can't be closed" or fill sizes until picked
  const quoted = (rows ?? []).filter((r) => r.pair.slug === pickSlug && r.data)
  const fills = useLoopFillHints(
    quoted.map((r) => ({
      pair: r.pair,
      prices: {
        collateralPriceUsd: Number(r.collateralReserve?.priceInUsd ?? 0),
        debtPriceUsd: Number(r.debtReserve?.priceInUsd ?? 0),
      },
    })),
  )

  const candidates: Candidate[] = (rows ?? []).flatMap((row) => {
    // only loops that can open are offered (hidden reserves never get here);
    // a collateral left with none drops out
    if (
      !row.data ||
      row.data.unavailableReason ||
      !row.collateralReserve ||
      !row.debtReserve
    )
      return []
    const fill = fills.get(row.pair.slug)
    const cantUnwind = fill ? !fill.unwindFills : false
    // known only once the loop is picked and probed
    const reason = cantUnwind
      ? t("multiply.unavailable.cantUnwind", {
          slippage,
        })
      : null
    return [
      {
        ...row,
        collateralAssetId: row.pair.collateralAssetId,
        maxNetApy: row.data.maxNetApy,
        unavailable: !!reason,
        reason,
        fills: fill,
        existing: findPairByAssets(
          pairs,
          row.pair.collateralAssetId,
          row.pair.debtAssetId,
        ),
      },
    ]
  })

  const collaterals = summarizeCollaterals(candidates)
  const debtLoops = sortDebtLoops(
    candidates.filter(
      (c) =>
        c.collateralAssetId === collateralId &&
        c.pair.debtAssetId !== collateralId,
    ),
  )
  const pick = candidates.find((c) => c.pair.slug === pickSlug) ?? null

  const percent = (value: number | null) =>
    value === null ? "—" : t("common:percent", { value: value * 100 })
  const leverage = (value: number) => t("cards.multiply.leverage", { value })

  const numeric = { textAlign: "end" } as const
  const apyCell = (value: number | null) => (
    <TableCell sx={numeric}>
      <Text fs="p4" fw={600} color={apyColor(value)}>
        {percent(value)}
      </Text>
    </TableCell>
  )
  const leverageCell = (value: number) => (
    <TableCell sx={numeric}>
      <Text fs="p4" fw={600}>
        {leverage(value)}
      </Text>
    </TableCell>
  )

  // ValueStats has no weight prop; sizes match its "small" value
  const stat = (
    label: string,
    value: string,
    color = getToken("text.high"),
  ) => (
    <ValueStats
      wrap
      size="small"
      label={label}
      customValue={
        <Text
          font="secondary"
          fs={["base", "h7"]}
          lh={1}
          fw={600}
          color={color}
        >
          {value}
        </Text>
      }
    />
  )

  const stats = pick
    ? [
        {
          label: t("cards.multiply.maxApy"),
          value: percent(pick.maxNetApy),
          color: apyColor(pick.maxNetApy),
        },
        {
          label: t("cards.multiply.maxLeverage"),
          value: leverage(pick.data!.maxLeverage),
        },
        {
          label: t("multiply.details.liquidityAvailable"),
          value: t("common:currency.compact", {
            value:
              Number(pick.data!.availableLiquidity) *
              Number(pick.debtReserve!.priceInUsd),
          }),
        },
      ]
    : []

  const create = () => {
    if (!pick) return
    if (!pick.existing)
      add({
        collateralAssetId: pick.pair.collateralAssetId,
        debtAssetId: pick.pair.debtAssetId,
      })
    onSelect(pick.existing ?? pick.pair)
    onClose()
  }

  const riskBadge = (c: Candidate) =>
    c.risk && (
      <PairRiskIndicator
        risk={c.risk}
        collateral={symbol(c.pair.collateralAssetId)}
        debt={symbol(c.pair.debtAssetId)}
        hf={c.data!.maxLeverageHf}
      />
    )

  const assetCell = (id: string, reason: string | null) => (
    <TableCell>
      <AssetLabelFullContainer>
        <AssetLogo id={display(id).logoId} size="small" />
        <Stack gap="xs">
          <AssetLabel symbol={symbol(id)} />
          {reason && (
            <Text fs="p6" color={getToken("text.low")}>
              {reason}
            </Text>
          )}
        </Stack>
      </AssetLabelFullContainer>
    </TableCell>
  )

  // a step is done once it holds a pick; done steps can be reopened
  const done = [!!collateralId, !!pick, false]
  const stepState = (i: number) =>
    done[i] ? "done" : step === i ? "active" : "todo"
  const openStep = (i: number) => (open: boolean) => {
    if (open && (i === 0 || done[i - 1])) setStep(i)
  }

  const wizardStep = (
    i: 0 | 1 | 2,
    summary: string | null,
    assetId?: string | null,
  ) => (
    <WizardStep
      sx={{ paddingInline: "var(--modal-content-padding)" }}
      stepNumber={i + 1}
      icon={assetId && <AssetLogo id={display(assetId).logoId} collapsed />}
      state={stepState(i)}
      title={t(`multiply.custom.step.${STEPS[i]}`)}
      description={
        (done[i] && summary) || t(`multiply.custom.hint.${STEPS[i]}`)
      }
    />
  )

  return (
    <Modal variant="popup" open onOpenChange={onClose}>
      <ModalHeader title={t("multiply.custom.title")} />
      <ModalBody scrollable={false} noPadding>
        <Collapsible
          open={step === 0}
          onOpenChange={openStep(0)}
          trigger={wizardStep(
            0,
            collateralId && symbol(collateralId),
            collateralId,
          )}
        >
          <StepList>
            <SOptionTable size="compact">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common:asset")}</TableHead>
                  <TableHead sx={numeric}>
                    {t("multiply.custom.bestApy")}
                  </TableHead>
                  <TableHead sx={numeric}>
                    {t("cards.multiply.maxLeverage")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaterals.map(
                  ({ collateralAssetId, valid, best, reason }) => (
                    <MultiplyOptionRow
                      key={collateralAssetId}
                      selected={collateralId === collateralAssetId}
                      disabled={!best}
                      onSelect={() => {
                        if (collateralId !== collateralAssetId) {
                          setCollateralId(collateralAssetId)
                          setPickSlug(null)
                        }
                        setStep(1)
                      }}
                    >
                      {assetCell(
                        collateralAssetId,
                        best ? null : (reason ?? t("multiply.custom.cantLoop")),
                      )}
                      {best ? (
                        <>
                          {apyCell(best.maxNetApy)}
                          {leverageCell(
                            Math.max(...valid.map((c) => c.data!.maxLeverage)),
                          )}
                        </>
                      ) : (
                        <>
                          <TableCell />
                          <TableCell />
                        </>
                      )}
                    </MultiplyOptionRow>
                  ),
                )}
              </TableBody>
            </SOptionTable>
          </StepList>
        </Collapsible>

        <Separator />

        <Collapsible
          open={step === 1}
          onOpenChange={openStep(1)}
          trigger={wizardStep(
            1,
            pick && symbol(pick.pair.debtAssetId),
            pick?.pair.debtAssetId,
          )}
        >
          <StepList>
            <SOptionTable size="compact">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common:asset")}</TableHead>
                  <TableHead>{t("multiply.risk.column")}</TableHead>
                  <TableHead sx={numeric}>
                    {t("cards.multiply.maxApy")}
                  </TableHead>
                  <TableHead sx={numeric}>
                    {t("cards.multiply.maxLeverage")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debtLoops.map((c) => (
                  <MultiplyOptionRow
                    key={c.pair.slug}
                    selected={pickSlug === c.pair.slug}
                    disabled={c.unavailable}
                    onSelect={() => {
                      setPickSlug(c.pair.slug)
                      setStep(2)
                    }}
                  >
                    {assetCell(c.pair.debtAssetId, c.reason)}
                    {c.unavailable ? (
                      <>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </>
                    ) : (
                      <>
                        <TableCell>{riskBadge(c)}</TableCell>
                        {apyCell(c.maxNetApy)}
                        {leverageCell(c.data!.maxLeverage)}
                      </>
                    )}
                  </MultiplyOptionRow>
                ))}
              </TableBody>
            </SOptionTable>
          </StepList>
        </Collapsible>

        <Separator />

        <Collapsible
          open={step === 2}
          onOpenChange={openStep(2)}
          trigger={wizardStep(2, null)}
        >
          {pick && (
            <Stack gap="l" p="var(--modal-content-padding)" pt={0}>
              <Paper
                shadow={false}
                bg="dim"
                sx={{ containerType: "inline-size" }}
              >
                <Flex align="center" justify="space-between" gap="m" p="xl">
                  <AssetLabelFullContainer>
                    <AssetLogo
                      id={[
                        display(pick.pair.collateralAssetId).logoId,
                        display(pick.pair.debtAssetId).logoId,
                      ]}
                      collapsed
                    />
                    <AssetLabel
                      symbol={`${symbol(pick.pair.collateralAssetId)} / ${symbol(pick.pair.debtAssetId)}`}
                      name={t("multiply.custom.pairSubtitle", {
                        collateral: symbol(pick.pair.collateralAssetId),
                        debt: symbol(pick.pair.debtAssetId),
                      })}
                    />
                  </AssetLabelFullContainer>
                  {pick.risk && (
                    <PairRiskIndicator
                      withLabel
                      risk={pick.risk}
                      collateral={symbol(pick.pair.collateralAssetId)}
                      debt={symbol(pick.pair.debtAssetId)}
                      hf={pick.data!.maxLeverageHf}
                    />
                  )}
                </Flex>
                <Separator />
                {/* stat tiles when the card is wide, plain rows when narrow */}
                <Box sx={{ [WIDE]: { display: "none" } }}>
                  <Summary
                    px="xl"
                    withTrailingSeparator
                    separator={<Separator mx="-xl" />}
                    rows={stats.map(({ label, value, color }) => ({
                      label,
                      content: (
                        <SummaryRowValue color={color}>{value}</SummaryRowValue>
                      ),
                    }))}
                  />
                </Box>
                <Box display="none" sx={{ [WIDE]: { display: "block" } }}>
                  <Box p="xl">
                    <ValueStatsGroup>
                      {stats.map(({ label, value, color }) => (
                        <Fragment key={label}>
                          {stat(label, value, color)}
                        </Fragment>
                      ))}
                    </ValueStatsGroup>
                  </Box>
                  <Separator />
                </Box>
                <Summary
                  px="xl"
                  separator={<Separator mx="-xl" />}
                  rows={[
                    ...(pick.pair.eMode !== 0
                      ? [
                          {
                            label: t("multiply.custom.eMode"),
                            content: pick.collateralReserve!.eModeLabel,
                          },
                        ]
                      : []),
                    {
                      label: t("multiply.pairDetails.largestFall"),
                      tooltip: t("multiply.pairDetails.largestFallTooltip", {
                        collateral: symbol(pick.pair.collateralAssetId),
                        debt: symbol(pick.pair.debtAssetId),
                      }),
                      content: percent(pick.risk?.largestFall ?? null),
                    },
                    {
                      label: t("multiply.pairDetails.penalty"),
                      tooltip: t("multiply.pairDetails.penaltyTooltip"),
                      content: percent(
                        Number(
                          pick.pair.eMode !== 0 &&
                            pick.collateralReserve!.eModeCategoryId ===
                              pick.pair.eMode
                            ? pick.collateralReserve!.eModeLiquidationBonus
                            : pick.collateralReserve!.liquidationBonus,
                        ),
                      ),
                    },
                  ]}
                />
              </Paper>
              {pick.reason && (
                <Alert variant="warning" description={pick.reason} />
              )}
            </Stack>
          )}
        </Collapsible>
      </ModalBody>
      {/* ponytail: not gated on the alert; the deposit form re-checks the fill at the real size */}
      {step === 2 && pick && (
        <ModalFooter>
          <Button size="large" width="100%" onClick={create}>
            {pick.existing
              ? t("multiply.custom.selectExisting")
              : t("multiply.custom.create")}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  )
}

const StepList = ({ children }: { children: React.ReactNode }) => (
  <ScrollArea sx={{ height: "auto" }}>
    <Box maxHeight={["calc(100dvh - 280px)", "calc(75dvh - 280px)"]}>
      {children}
    </Box>
  </ScrollArea>
)

const STEPS = ["collateral", "borrow", "review"] as const

// 580px
const WIDE = "@container (width >= 29rem)"
