import {
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { MultiplyPairLabel } from "@/modules/strategies/multiply/components/MultiplyPairLabel"
import { type MultiplyPairRow } from "@/modules/strategies/multiply/components/MultiplyPairs.columns"
import { SPairOption } from "@/modules/strategies/multiply/components/MultiplyPairSelectModal.styled"
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

  return (
    <Modal variant="popup" open onOpenChange={onClose}>
      <ModalHeader title={t("multiply.select.title")} />
      <ModalBody scrollable={false} noPadding>
        {pairs.map(({ pair, data }) => (
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
            <Flex gap="xl">
              <ValueStats
                wrap
                size="small"
                font="secondary"
                label={t("cards.multiply.maxApy")}
                customValue={
                  <Text
                    fs="p4"
                    fw={600}
                    color={getToken("accents.success.emphasis")}
                  >
                    {data && data.maxNetApy !== null
                      ? t("common:percent", { value: data.maxNetApy * 100 })
                      : "—"}
                  </Text>
                }
              />
              <ValueStats
                wrap
                size="small"
                font="secondary"
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
