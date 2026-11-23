import {
  Alert,
  Box,
  LoadingButton,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { MultiplyWithdrawSummary } from "@/modules/strategies/multiply/components/MultiplyWithdrawSummary"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { type MultiplyPosition } from "@/modules/strategies/multiply/hooks/useMultiplyPositions"

type Props = {
  pair: MultiplyPair
  position: MultiplyPosition
  collateralPriceUsd: number
  debtPriceUsd: number
  isPending: boolean
  onSubmit: () => void
  onClose: () => void
}

// Confirms a full exit: the same payout a max withdraw shows, no amount to enter.
export const MultiplyCloseModal: React.FC<Props> = ({
  pair,
  position,
  collateralPriceUsd,
  debtPriceUsd,
  isPending,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation("strategies")
  const display = useResolveAssetDisplay()
  const collateral = display(pair.collateralAssetId)
  const debt = display(pair.debtAssetId)

  return (
    <Modal variant="popup" open onOpenChange={onClose} disableInteractOutside>
      <ModalHeader
        title={t("multiply.close.title", {
          pair: `${collateral.symbol}/${debt.symbol}`,
        })}
      />
      <ModalBody>
        <MultiplyWithdrawSummary
          pair={pair}
          position={position}
          amount={formatUnits(position.nav, collateral.decimals)}
          isMax
          collateralPriceUsd={collateralPriceUsd}
          debtPriceUsd={debtPriceUsd}
        />
        <Box pt="l">
          <Alert
            variant="info"
            description={t("multiply.withdraw.maxNote", { debt: debt.symbol })}
          />
        </Box>
      </ModalBody>
      <Separator />
      <ModalFooter>
        <LoadingButton
          size="large"
          width="100%"
          isLoading={isPending}
          disabled={isPending}
          onClick={onSubmit}
        >
          {t("multiply.close.cta")}
        </LoadingButton>
      </ModalFooter>
    </Modal>
  )
}
