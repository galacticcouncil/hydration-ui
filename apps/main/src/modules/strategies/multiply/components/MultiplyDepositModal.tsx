import {
  Box,
  Modal,
  ModalBody,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { MultiplyOpenForm } from "@/modules/strategies/multiply/components/MultiplyOpenForm"
import { type MultiplyPairRow } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"

type MultiplyDepositModalProps = {
  row: MultiplyPairRow | null
  onClose: () => void
}

export const MultiplyDepositModal: React.FC<MultiplyDepositModalProps> = ({
  row,
  onClose,
}) => {
  const { t } = useTranslation("strategies")
  const display = useResolveAssetDisplay()

  return (
    <Modal variant="popup" open={!!row} onOpenChange={onClose}>
      <ModalHeader
        title={
          row
            ? t("multiply.open.modalTitle", {
                pair: `${display(row.pair.collateralAssetId).symbol}/${display(row.pair.debtAssetId).symbol}`,
              })
            : ""
        }
      />
      <ModalBody scrollable={false} noPadding>
        {row && (
          <Box px="xl" position="relative">
            <MultiplyOpenForm
              key={row.pair.slug}
              pair={row.pair}
              metrics={row.data}
              risk={row.risk}
              collateralReserve={row.collateralReserve}
              debtReserve={row.debtReserve}
              onSuccess={onClose}
            />
          </Box>
        )}
      </ModalBody>
    </Modal>
  )
}
