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
  Text,
  WizardStep,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { MultiplyPairLabel } from "@/modules/strategies/multiply/components/MultiplyPairLabel"
import { SPairOption } from "@/modules/strategies/multiply/components/MultiplyPairSelectModal.styled"
import { PreviewRow } from "@/modules/strategies/multiply/components/MultiplyPositionPreview"
import {
  apyColor,
  MultiplyStat,
} from "@/modules/strategies/multiply/components/MultiplyStat"
import { RiskBadge } from "@/modules/strategies/multiply/components/RiskBadge"
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
          slippage: row.pair.slippageBps / 100,
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

  const stat = (
    label: string,
    value: React.ReactNode,
    color?: React.ComponentProps<typeof Text>["color"],
  ) => <MultiplyStat label={label} value={value} color={color} />
  const apyStat = (label: string, value: number | null) =>
    stat(label, percent(value), apyColor(value))

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
      <RiskBadge
        risk={c.risk}
        collateral={symbol(c.pair.collateralAssetId)}
        debt={symbol(c.pair.debtAssetId)}
        hf={c.data!.maxLeverageHf}
      />
    )

  const assetRow = (id: string, sub: string | null) => (
    <Box flexShrink={0}>
      <AssetLabelFullContainer>
        <AssetLogo id={display(id).logoId} />
        <Stack gap="xs">
          <AssetLabel symbol={symbol(id)} />
          {sub && (
            <Text fs="p6" color={getToken("text.low")} whiteSpace="nowrap">
              {sub}
            </Text>
          )}
        </Stack>
      </AssetLabelFullContainer>
    </Box>
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
            {collaterals.map(({ collateralAssetId, valid, best, reason }) => (
              <SPairOption
                key={collateralAssetId}
                type="button"
                selected={collateralId === collateralAssetId}
                disabled={!best}
                onClick={() => {
                  if (collateralId !== collateralAssetId) {
                    setCollateralId(collateralAssetId)
                    setPickSlug(null)
                  }
                  setStep(1)
                }}
              >
                {assetRow(
                  collateralAssetId,
                  best
                    ? t("multiply.custom.loopsAvailable", {
                        count: valid.length,
                      })
                    : (reason ?? t("multiply.custom.cantLoop")),
                )}
                {best && (
                  <Flex gap="l" align="center">
                    {apyStat(t("multiply.custom.bestApy"), best.maxNetApy)}
                    {stat(
                      t("cards.multiply.maxLeverage"),
                      leverage(
                        Math.max(...valid.map((c) => c.data!.maxLeverage)),
                      ),
                    )}
                  </Flex>
                )}
              </SPairOption>
            ))}
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
            {debtLoops.map((c) => (
              <SPairOption
                key={c.pair.slug}
                type="button"
                selected={pickSlug === c.pair.slug}
                onClick={() => {
                  setPickSlug(c.pair.slug)
                  setStep(2)
                }}
              >
                {assetRow(c.pair.debtAssetId, c.reason)}
                {!c.unavailable && (
                  <Flex gap="l" align="center">
                    {riskBadge(c)}
                    {apyStat(t("cards.multiply.maxApy"), c.maxNetApy)}
                    {stat(
                      t("cards.multiply.maxLeverage"),
                      leverage(c.data!.maxLeverage),
                    )}
                  </Flex>
                )}
              </SPairOption>
            ))}
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
              <Paper p="m" shadow={false}>
                <Stack gap="m">
                  <Flex align="center" justify="space-between">
                    <MultiplyPairLabel pair={pick.pair} />
                    {riskBadge(pick)}
                  </Flex>
                  <Separator mx="-m" />
                  <Stack gap="xs">
                    <PreviewRow
                      label={t("cards.multiply.maxApy")}
                      value={
                        <Text
                          fs="p5"
                          fw={600}
                          lh={1}
                          color={apyColor(pick.maxNetApy)}
                        >
                          {percent(pick.maxNetApy)}
                        </Text>
                      }
                    />
                    <PreviewRow
                      label={t("cards.multiply.maxLeverage")}
                      value={leverage(pick.data!.maxLeverage)}
                    />
                    {pick.pair.eMode !== 0 && (
                      <PreviewRow
                        label={t("multiply.custom.eMode")}
                        value={pick.collateralReserve!.eModeLabel}
                      />
                    )}
                    <PreviewRow
                      label={t("multiply.details.liquidityAvailable")}
                      value={t("common:currency.compact", {
                        value:
                          Number(pick.data!.availableLiquidity) *
                          Number(pick.debtReserve!.priceInUsd),
                      })}
                    />
                  </Stack>
                </Stack>
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
