import {
  AssetInput,
  Box,
  Button,
  Checkbox,
  Flex,
  Label,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { BilLogo } from "@/modules/strategies/bil/components/BilLogo"
import { useInstantQuote } from "@/modules/strategies/bil/hooks/useStableswap"

import {
  projectRate,
  type WithdrawMethod,
  WithdrawMethodPicker,
} from "./WithdrawMethodPicker"

interface VaultStats {
  exchangeRate: number
  worstCaseWaitDays: number
  nextMaturityDays: number
  minRedeem: number
  apr: number
}

interface Props {
  open: boolean
  onClose: () => void
  vaultStats: VaultStats
  bilBalance: number
  onRequestRedeem: (amount: number) => void
  onInstantRedeem?: (amount: number) => void
  instantAvailable: boolean
  isPending: boolean
}

export const WithdrawModal = ({
  open,
  onClose,
  vaultStats,
  bilBalance,
  onRequestRedeem,
  onInstantRedeem,
  instantAvailable,
  isPending,
}: Props) => {
  const { t } = useTranslation(["bil", "common"])
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<WithdrawMethod>("queue")
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (!open) {
      setAmount("")
      setMethod("queue")
      setAcknowledged(false)
    }
  }, [open])

  const inputNum = parseFloat(amount) || 0
  const usdValue = inputNum * vaultStats.exchangeRate
  const isBelowMin = inputNum > 0 && inputNum < vaultStats.minRedeem
  const overBalance = inputNum > bilBalance

  const projectedQueueRate = projectRate(
    vaultStats.exchangeRate,
    vaultStats.apr,
    vaultStats.worstCaseWaitDays,
  )
  const queueHollarOut = inputNum * projectedQueueRate
  const { quote: instantQuote } = useInstantQuote(inputNum, queueHollarOut)

  const canSubmit =
    inputNum > 0 &&
    !isBelowMin &&
    !overBalance &&
    acknowledged &&
    !isPending &&
    (method === "queue" || (instantAvailable && !!onInstantRedeem))

  const ctaLabel = (() => {
    if (isPending) return t("withdraw.cta.pending")
    if (overBalance) return t("withdraw.cta.insufficient")
    if (isBelowMin)
      return t("withdraw.cta.belowMin", {
        symbol: "BIL",
        value: vaultStats.minRedeem,
      })
    if (method === "instant" && !instantAvailable)
      return t("withdraw.cta.unavailable")
    return t("withdraw.cta.withdraw")
  })()

  const amountError = overBalance
    ? t("withdraw.cta.insufficient")
    : isBelowMin
      ? t("withdraw.cta.belowMin", {
          symbol: "BIL",
          value: vaultStats.minRedeem,
        })
      : undefined

  const handleSubmit = () => {
    if (!canSubmit) return
    if (method === "queue") onRequestRedeem(inputNum)
    else onInstantRedeem?.(inputNum)
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
            symbol="BIL"
            selectedAssetIcon={<BilLogo size={24} />}
            modalDisabled
            value={amount}
            onChange={setAmount}
            displayValue={
              inputNum > 0
                ? t("common:currency", { value: usdValue })
                : t("common:currency", { value: 0 })
            }
            maxBalance={bilBalance.toString()}
            maxButtonBalance={bilBalance.toString()}
            amountError={amountError}
          />
        </Box>

        <ModalContentDivider />

        <Box px="xl" py="l">
          <Text fs="p5" fw={500} color={getToken("text.medium")} mb="m">
            {t("withdraw.method")}
          </Text>
          <WithdrawMethodPicker
            selected={method}
            onSelect={setMethod}
            amountBil={inputNum}
            exchangeRate={vaultStats.exchangeRate}
            aprPercent={vaultStats.apr}
            worstCaseWaitDays={vaultStats.worstCaseWaitDays}
            nextMaturityDays={vaultStats.nextMaturityDays}
            instantQuote={instantQuote}
            instantAvailable={instantAvailable}
          />
        </Box>

        <ModalContentDivider />

        <Box px="xl" py="l">
          <Flex align="center" gap="base">
            <Label
              fs="p4"
              lh={1.2}
              fw={500}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "base",
                cursor: "pointer",
              }}
            >
              <Checkbox
                name="withdraw-ack"
                checked={acknowledged}
                onCheckedChange={(c) => setAcknowledged(!!c)}
              />
              {method === "instant"
                ? t("withdraw.ackInstant")
                : t("withdraw.ack")}
            </Label>
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
