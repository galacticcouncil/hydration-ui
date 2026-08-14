import {
  Alert,
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
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"

interface VaultStats {
  exchangeRate: number
  minRedeem: number
  /** global vault pause — `requestRedeem` is whenNotPaused. */
  paused: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  vaultStats: VaultStats
  /** Vault share balance available to redeem. */
  shareBalance: number
  /** This vault's share of the SubLoop equity (WAD); null while unknown. */
  loopEquity: bigint | null
  onRequestRedeem: (amount: number) => void
  isPending: boolean
}

export const WithdrawModal = ({
  open,
  onClose,
  vaultStats,
  shareBalance,
  loopEquity,
  onRequestRedeem,
  isPending,
}: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const { symbol, shareSymbol } = useActivePropellerVault()
  const [amount, setAmount] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (!open) {
      setAmount("")
      setAcknowledged(false)
    }
  }, [open])

  const inputNum = parseFloat(amount) || 0
  // Shares → collateral at the current vault rate. `requestRedeem` snapshots
  // the owed amount at request time, so this is what the request will lock in.
  const assetOut = inputNum * vaultStats.exchangeRate
  const isBelowMin = inputNum > 0 && inputNum < vaultStats.minRedeem
  const overBalance = inputNum > shareBalance

  // `requestRedeem` reverts on both of these — block the CTA instead of
  // letting the user pay for a failing tx. A null equity read (loading or
  // reverted) never blocks.
  const blockedReason = vaultStats.paused
    ? "paused"
    : loopEquity === 0n
      ? "noEquity"
      : null

  const canSubmit =
    inputNum > 0 &&
    !isBelowMin &&
    !overBalance &&
    acknowledged &&
    !isPending &&
    !blockedReason

  const ctaLabel = (() => {
    if (blockedReason) return t("withdraw.cta.unavailable")
    if (isPending) return t("withdraw.cta.pending")
    if (overBalance) return t("withdraw.cta.insufficient", { shareSymbol })
    if (isBelowMin)
      return t("withdraw.cta.belowMin", {
        shareSymbol,
        min: vaultStats.minRedeem,
      })
    return t("withdraw.cta.withdraw")
  })()

  const amountError = overBalance
    ? t("withdraw.cta.insufficient", { shareSymbol })
    : isBelowMin
      ? t("withdraw.cta.belowMin", {
          shareSymbol,
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
      <ModalHeader title={t("withdraw.title", { shareSymbol })} />
      <ModalBody noPadding>
        <Box px="xl">
          <AssetInput
            label={t("withdraw.amount")}
            symbol={shareSymbol}
            selectedAssetIcon={<PropellerLogo size="medium" />}
            modalDisabled
            value={amount}
            onChange={setAmount}
            displayValue={t("common:currency", { value: assetOut })}
            maxBalance={shareBalance.toString()}
            maxButtonBalance={shareBalance.toString()}
            amountError={amountError}
          />
        </Box>

        {blockedReason && (
          <Box px="xl" pt="l">
            <Alert
              variant="warning"
              title={t(`withdraw.blocked.${blockedReason}`)}
            />
          </Box>
        )}

        <ModalContentDivider />

        <Box px="xl" py="l">
          <Flex align="center" gap="base">
            <Checkbox
              name="withdraw-ack"
              checked={acknowledged}
              onCheckedChange={(c) => setAcknowledged(!!c)}
            />
            <Text fs="p5" onClick={() => setAcknowledged((v) => !v)}>
              {t("withdraw.ack", { symbol, shareSymbol })}
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
