import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  AssetInput,
  LoadingButton,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { useEvmAddress } from "@galacticcouncil/web3-connect"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"
import { useBilPoolPosition } from "@/modules/strategies/bil/hooks/useBilPoolPosition"
import { useRepayHollar } from "@/modules/strategies/bil/hooks/useBilPoolWrites"
import { useUserBalances } from "@/modules/strategies/bil/hooks/useVaultReads"
import { getBilRepayHealthFactor } from "@/modules/strategies/bil/utils/hf"

interface Props {
  open: boolean
  onClose: () => void
}

export const RepayHollarModal = ({ open, onClose }: Props) => {
  const { t } = useTranslation(["strategies", "common"])
  const [amount, setAmount] = useState("")

  const { hollar } = useBilStrategy()

  const evmAddress = useEvmAddress()
  const { data: poolPosition } = useBilPoolPosition(evmAddress)
  const { data: balances } = useUserBalances(evmAddress)
  const repayMutation = useRepayHollar({ onClose })

  const walletHollar = balances?.hollar ?? 0

  const inputNum = parseFloat(amount) || 0
  const totalDebtUsd = poolPosition?.totalDebtUsd ?? 0
  const healthFactor = poolPosition
    ? getBilRepayHealthFactor(poolPosition, inputNum)
    : null
  const maxRepay = Math.min(walletHollar, totalDebtUsd)
  const overDebt = inputNum > totalDebtUsd
  const overWallet = inputNum > walletHollar

  const canSubmit =
    inputNum > 0 &&
    !overDebt &&
    !overWallet &&
    !repayMutation.isPending &&
    totalDebtUsd > 0

  const handleSubmit = () => {
    repayMutation.mutate({
      amount: inputNum,
      repayAll: inputNum > 0 && Big(inputNum).gte(totalDebtUsd.toString()),
    })
  }

  const ctaLabel = (() => {
    if (overDebt) return t("bil.repay.cta.exceeds")
    if (overWallet) return t("bil.repay.cta.insufficient")
    return t("bil.repay.cta.repay")
  })()

  const amountError = overDebt
    ? t("bil.repay.cta.exceeds")
    : overWallet
      ? t("bil.repay.cta.insufficient")
      : undefined

  return (
    <Modal
      variant="popup"
      open={open}
      onOpenChange={onClose}
      disableInteractOutside
    >
      <ModalHeader title={t("bil.repay.title")} />

      <ModalBody>
        <AssetInput
          sx={{ pt: 0 }}
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

        {healthFactor && totalDebtUsd > 0 && (
          <Summary
            withLeadingSeparator
            separator={<ModalContentDivider />}
            mb="var(--modal-content-inset)"
          >
            <SummaryRow
              label={t("common:healthFactor")}
              content={<HealthFactorChange {...healthFactor} />}
            />
          </Summary>
        )}
      </ModalBody>

      <ModalFooter>
        <LoadingButton
          size="large"
          width="100%"
          isLoading={repayMutation.isPending}
          disabled={!canSubmit}
          onClick={() => canSubmit && handleSubmit()}
        >
          {ctaLabel}
        </LoadingButton>
      </ModalFooter>
    </Modal>
  )
}
