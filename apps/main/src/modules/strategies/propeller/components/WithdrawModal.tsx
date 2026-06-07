import {
  AssetInput,
  Box,
  Button,
  Checkbox,
  Flex,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { PropellerLogo } from "@/modules/strategies/propeller/components/PropellerLogo"

interface VaultStats {
  exchangeRate: number
  minRedeem: number
}

interface Props {
  open: boolean
  onClose: () => void
  vaultStats: VaultStats
  /** pETH share balance available to redeem. */
  shareBalance: number
  onRequestRedeem: (amount: number) => void
  isPending: boolean
}

export const WithdrawModal = ({
  open,
  onClose,
  vaultStats,
  shareBalance,
  onRequestRedeem,
  isPending,
}: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const [amount, setAmount] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (!open) {
      setAmount("")
      setAcknowledged(false)
    }
  }, [open])

  const inputNum = parseFloat(amount) || 0
  // pETH → ETH at the current vault rate. The queue settles at the rate at
  // settlement time; this is an indicative estimate.
  const ethOut = inputNum * vaultStats.exchangeRate
  const isBelowMin = inputNum > 0 && inputNum < vaultStats.minRedeem
  const overBalance = inputNum > shareBalance

  const canSubmit =
    inputNum > 0 && !isBelowMin && !overBalance && acknowledged && !isPending

  const ctaLabel = (() => {
    if (isPending) return t("withdraw.cta.pending")
    if (overBalance) return t("withdraw.cta.insufficient")
    if (isBelowMin)
      return t("withdraw.cta.belowMin", {
        symbol: "pETH",
        min: vaultStats.minRedeem,
      })
    return t("withdraw.cta.withdraw")
  })()

  const amountError = overBalance
    ? t("withdraw.cta.insufficient")
    : isBelowMin
      ? t("withdraw.cta.belowMin", {
          symbol: "pETH",
          min: vaultStats.minRedeem,
        })
      : undefined

  const handleSubmit = () => {
    if (!canSubmit) return
    onRequestRedeem(inputNum)
  }

  return (
    <Modal
      variant="popup"
      open={open}
      onOpenChange={onClose}
      disableInteractOutside
    >
      <ModalHeader title={t("withdraw.title")} />
      <ModalBody noPadding>
        <Box px="xl">
          <AssetInput
            label={t("withdraw.amount")}
            symbol="pETH"
            selectedAssetIcon={<PropellerLogo size={24} />}
            modalDisabled
            value={amount}
            onChange={setAmount}
            displayValue={t("common:currency", { value: ethOut })}
            maxBalance={shareBalance.toString()}
            maxButtonBalance={shareBalance.toString()}
            amountError={amountError}
          />
        </Box>

        <ModalContentDivider />

        <Box px="xl" py="l">
          <Flex align="center" gap="base">
            <Checkbox
              name="withdraw-ack"
              checked={acknowledged}
              onCheckedChange={(c) => setAcknowledged(!!c)}
            />
            <Text fs="p5" onClick={() => setAcknowledged((v) => !v)}>
              {t("withdraw.ack")}
            </Text>
          </Flex>
        </Box>
      </ModalBody>

      <ModalFooter>
        <Button
          size="large"
          width="100%"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {ctaLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
