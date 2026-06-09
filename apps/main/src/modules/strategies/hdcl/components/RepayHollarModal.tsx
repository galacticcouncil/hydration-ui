import {
  AssetInput,
  Box,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import type { HdclPoolPosition } from "@/modules/strategies/hdcl/hooks/useHdclPoolPosition"
import { useAssets } from "@/providers/assetsProvider"

interface Props {
  open: boolean
  onClose: () => void
  poolPosition: HdclPoolPosition | undefined
  /** User's wallet HOLLAR balance (caps the max repay). */
  walletHollar: number
  onRepay: (amount: number) => void
  isPending: boolean
}

export const RepayHollarModal = ({
  open,
  onClose,
  poolPosition,
  walletHollar,
  onRepay,
  isPending,
}: Props) => {
  const { t } = useTranslation(["strategies", "common"])
  const [amount, setAmount] = useState("")

  const { getAssetWithFallback } = useAssets()
  const hollar = getAssetWithFallback(HOLLAR_ASSET_ID)

  useEffect(() => {
    if (!open) setAmount("")
  }, [open])

  const inputNum = parseFloat(amount) || 0
  const totalDebtUsd = poolPosition?.totalDebtUsd ?? 0
  // Repay max = min(walletHollar, debt) — can't repay more than you owe
  // and can't repay more than you hold.
  const maxRepay = Math.min(walletHollar, totalDebtUsd)
  const overDebt = inputNum > totalDebtUsd
  const overWallet = inputNum > walletHollar

  const canSubmit =
    inputNum > 0 && !overDebt && !overWallet && !isPending && totalDebtUsd > 0

  const ctaLabel = (() => {
    if (overDebt) return t("hdcl.repay.cta.exceeds")
    if (overWallet) return t("hdcl.repay.cta.insufficient")
    return t("hdcl.repay.cta.repay")
  })()

  const amountError = overDebt
    ? t("hdcl.repay.cta.exceeds")
    : overWallet
      ? t("hdcl.repay.cta.insufficient")
      : undefined

  return (
    <Modal variant="popup" open={open} onOpenChange={(o) => !o && onClose()}>
      <ModalHeader title={t("hdcl.repay.title")} />

      <ModalBody noPadding>
        <Box px="xl" py="l">
          <AssetInput
            sx={{ p: 0 }}
            label={t("common:amount")}
            symbol={hollar.symbol}
            selectedAssetIcon={<AssetLogo id={hollar.id} size="medium" />}
            modalDisabled
            value={amount}
            onChange={setAmount}
            displayValue={t("common:currency", {
              value: inputNum,
            })}
            maxBalance={maxRepay.toString()}
            maxButtonBalance={maxRepay.toString()}
            amountError={amountError}
          />
        </Box>
      </ModalBody>

      <ModalFooter>
        <Button
          size="large"
          width="100%"
          disabled={!canSubmit}
          onClick={() => canSubmit && onRepay(inputNum)}
        >
          {ctaLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
