import {
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { MultiplyPairLabel } from "@/modules/strategies/multiply/components/MultiplyPairLabel"
import { type MultiplyPairRow } from "@/modules/strategies/multiply/components/MultiplyPairs.columns"
import { SPairOption } from "@/modules/strategies/multiply/components/MultiplyPairSelectModal.styled"
import {
  apyColor,
  MultiplyStat,
} from "@/modules/strategies/multiply/components/MultiplyStat"
import { RiskBadge } from "@/modules/strategies/multiply/components/RiskBadge"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"

type MultiplyPairSelectModalProps = {
  pairs: MultiplyPairRow[]
  selected: MultiplyPair
  onSelect: (pair: MultiplyPair) => void
  onClose: () => void
}

export const MultiplyPairSelectModal: React.FC<
  MultiplyPairSelectModalProps
> = ({ pairs, selected, onSelect, onClose }) => {
  const { t } = useTranslation(["strategies", "common"])
  const display = useResolveAssetDisplay()

  return (
    <Modal variant="popup" open onOpenChange={onClose}>
      <ModalHeader title={t("multiply.select.title")} />
      <ModalBody scrollable={false} noPadding>
        {pairs.map(({ pair, data, risk }) => (
          <SPairOption
            key={pair.slug}
            type="button"
            selected={pair.slug === selected.slug}
            onClick={() => {
              onSelect(pair)
              onClose()
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
                    ? t("cards.multiply.leverage", { value: data.maxLeverage })
                    : "—"
                }
              />
            </Flex>
          </SPairOption>
        ))}
      </ModalBody>
    </Modal>
  )
}
