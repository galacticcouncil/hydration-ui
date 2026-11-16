import {
  Box,
  Collapsible,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  ScrollArea,
  Separator,
  WizardStep,
} from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { MultiplyPairLabel } from "@/modules/strategies/multiply/components/MultiplyPairLabel"
import { type MultiplyPairRow } from "@/modules/strategies/multiply/components/MultiplyPairs.columns"
import { SPairOption } from "@/modules/strategies/multiply/components/MultiplyPairSelectModal.styled"
import { MultiplyPayAssetList } from "@/modules/strategies/multiply/components/MultiplyPayAssetList"
import {
  apyColor,
  MultiplyStat,
} from "@/modules/strategies/multiply/components/MultiplyStat"
import { RiskBadge } from "@/modules/strategies/multiply/components/RiskBadge"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { useCanPickPay } from "@/modules/strategies/multiply/hooks/usePayAsset"

export type MultiplySelectStep = "pair" | "pay"

type MultiplyPairSelectModalProps = {
  pairs: MultiplyPairRow[]
  selected: MultiplyPair
  /** the pay asset in use for `selected` */
  payAssetId: string
  /** "pay" opens on the pay-asset step for `selected` */
  initialStep?: MultiplySelectStep
  onSelect: (pair: MultiplyPair, payAssetId: string) => void
  onClose: () => void
}

/**
 * Two steps: the loop, then the asset the user pays with. A loop that can only
 * be entered with its collateral is picked in one.
 */
export const MultiplyPairSelectModal: React.FC<
  MultiplyPairSelectModalProps
> = ({
  pairs,
  selected,
  payAssetId,
  initialStep = "pair",
  onSelect,
  onClose,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const display = useResolveAssetDisplay()
  const [step, setStep] = useState(initialStep)
  const [pick, setPick] = useState(selected)
  const canPickPay = useCanPickPay()

  const pairSymbol = (pair: MultiplyPair) =>
    `${display(pair.collateralAssetId).symbol}/${display(pair.debtAssetId).symbol}`

  const pairList = (
    <ScrollArea sx={{ height: "auto" }}>
      <Box maxHeight={["calc(100dvh - 280px)", "calc(75dvh - 280px)"]}>
        {pairs.map(({ pair, data, risk }) => (
          <SPairOption
            key={pair.slug}
            type="button"
            selected={pair.slug === pick.slug}
            onClick={() => {
              if (!canPickPay(pair)) {
                onSelect(pair, pair.collateralAssetId)
                onClose()
                return
              }
              setPick(pair)
              setStep("pay")
            }}
          >
            <MultiplyPairLabel pair={pair} />
            <Flex gap="l" align="center">
              {risk && data && (
                <RiskBadge
                  risk={risk}
                  collateral={display(pair.collateralAssetId).symbol}
                  debt={display(pair.debtAssetId).symbol}
                  hf={data.maxLeverageHf}
                />
              )}
              <MultiplyStat
                label={t("cards.multiply.maxApy")}
                value={
                  data && data.maxNetApy !== null
                    ? t("common:percent", { value: data.maxNetApy * 100 })
                    : "—"
                }
                color={apyColor(data?.maxNetApy)}
              />
              <MultiplyStat
                label={t("cards.multiply.maxLeverage")}
                value={
                  data
                    ? t("cards.multiply.leverage", {
                        value: data.maxLeverage,
                      })
                    : "—"
                }
              />
            </Flex>
          </SPairOption>
        ))}
      </Box>
    </ScrollArea>
  )

  return (
    <Modal variant="popup" open onOpenChange={onClose}>
      <ModalHeader title={t("multiply.select.title")} />
      <ModalBody scrollable={false} noPadding>
        {/* a one-step loop is picked from the bare list, without step headers */}
        {!canPickPay(pick) ? (
          pairList
        ) : (
          <>
            <Collapsible
              open={step === "pair"}
              onOpenChange={(open) => open && setStep("pair")}
              trigger={
                <WizardStep
                  sx={{ paddingInline: "var(--modal-content-padding)" }}
                  stepNumber={1}
                  icon={
                    <AssetLogo
                      id={[
                        display(pick.collateralAssetId).logoId,
                        display(pick.debtAssetId).logoId,
                      ]}
                      collapsed
                    />
                  }
                  // a loop is always picked, so this step can always be reopened
                  state={step === "pair" ? "active" : "done"}
                  title={t("multiply.select.step.pair")}
                  description={
                    step === "pair"
                      ? t("multiply.select.hint.pair")
                      : pairSymbol(pick)
                  }
                />
              }
            >
              {pairList}
            </Collapsible>

            <Separator />

            <Collapsible
              open={step === "pay"}
              onOpenChange={(open) => open && setStep("pay")}
              trigger={
                <WizardStep
                  sx={{ paddingInline: "var(--modal-content-padding)" }}
                  stepNumber={2}
                  state={step === "pay" ? "active" : "todo"}
                  title={t("multiply.select.step.pay")}
                  description={t("multiply.select.hint.pay")}
                />
              }
            >
              {step === "pay" && (
                <MultiplyPayAssetList
                  pair={pick}
                  selectedAssetId={
                    pick.slug === selected.slug
                      ? payAssetId
                      : pick.collateralAssetId
                  }
                  onSelect={(assetId) => {
                    onSelect(pick, assetId)
                    onClose()
                  }}
                />
              )}
            </Collapsible>
          </>
        )}
      </ModalBody>
    </Modal>
  )
}
