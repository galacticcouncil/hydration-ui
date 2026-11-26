import {
  Box,
  Modal,
  ModalBody,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { MultiplyOpenForm } from "@/modules/strategies/multiply/components/MultiplyOpenForm"
import { MultiplyPayAssetList } from "@/modules/strategies/multiply/components/MultiplyPayAssetList"
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
  // the pair is fixed here, so only the pay-asset step is offered
  const [pay, setPay] = useState<{ slug: string; assetId: string } | null>(null)
  const [isPicking, setIsPicking] = useState(false)
  const payAssetId =
    row && pay?.slug === row.pair.slug
      ? pay.assetId
      : row?.pair.collateralAssetId

  // a reopened modal starts paying with the collateral again
  const close = () => {
    setIsPicking(false)
    setPay(null)
    onClose()
  }

  return (
    <Modal variant="popup" open={!!row} onOpenChange={close}>
      <ModalHeader
        title={
          !row
            ? ""
            : isPicking
              ? t("multiply.select.step.pay")
              : t("multiply.open.modalTitle", {
                  pair: `${display(row.pair.collateralAssetId).symbol}/${display(row.pair.debtAssetId).symbol}`,
                })
        }
        onBack={isPicking ? () => setIsPicking(false) : undefined}
      />
      {row && isPicking && (
        <MultiplyPayAssetList
          pair={row.pair}
          selectedAssetId={payAssetId ?? row.pair.collateralAssetId}
          onSelect={(assetId) => {
            setPay({ slug: row.pair.slug, assetId })
            setIsPicking(false)
          }}
        />
      )}
      {!isPicking && (
        <ModalBody scrollable={false} noPadding>
          {row && payAssetId && (
            <Box px="xl" position="relative">
              <MultiplyOpenForm
                key={`${row.pair.slug}-${payAssetId}`}
                pair={row.pair}
                payAssetId={payAssetId}
                metrics={row.data}
                risk={row.risk}
                collateralReserve={row.collateralReserve}
                debtReserve={row.debtReserve}
                onAssetClick={() => setIsPicking(true)}
                onPayAssetChange={(assetId) =>
                  setPay({ slug: row.pair.slug, assetId })
                }
                onSuccess={close}
              />
            </Box>
          )}
        </ModalBody>
      )}
    </Modal>
  )
}
