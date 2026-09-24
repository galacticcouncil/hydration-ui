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
import { getToken } from "@galacticcouncil/ui/utils"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { type Hex } from "viem"

import { AssetLogo } from "@/components/AssetLogo"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import {
  subLoopQuery,
  vaultBalancesQuery,
  vaultLoopPositionQuery,
  vaultStatsQuery,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useRequestRedeem } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

// Below 0.5% carry, the haircut is noise next to slippage; show the gross estimate.
const CARRY_DISPLAY_FLOOR = 0.005

type Props = {
  vault: PropellerVaultConfig
  open: boolean
  onClose: () => void
}

export const WithdrawModal = ({ vault, open, onClose }: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const { assetId, shareSymbol } = vault
  const { symbol, decimals } = getAssetWithFallback(assetId)

  const address = account?.address ?? ""
  const evmAddress = address
    ? (safeConvertSS58toH160(address) as Hex)
    : undefined

  const { data: stats } = useQuery(vaultStatsQuery(rpc, vault, decimals))
  const { data: balances } = useQuery(
    vaultBalancesQuery(rpc, vault, decimals, evmAddress),
  )
  const { data: loopPosition } = useQuery(vaultLoopPositionQuery(rpc, vault))
  const { data: subLoop } = useQuery(subLoopQuery(rpc))
  const redeem = useRequestRedeem(vault, { onSuccess: onClose })

  const vaultStats = {
    exchangeRate: stats?.exchangeRate ?? 1,
    minRedeem: stats?.minRedeem ?? 0,
    paused: stats?.paused ?? false,
  }
  const shareBalance = balances?.shares ?? 0
  const loopEquity = loopPosition?.equity ?? null
  const negativeCarry = subLoop?.negativeCarry ?? null
  const isPending = redeem.isPending
  const [amount, setAmount] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (!open) {
      setAmount("")
      setAcknowledged(false)
    }
  }, [open])

  const inputNum = parseFloat(amount) || 0
  const carry =
    negativeCarry !== null && negativeCarry >= CARRY_DISPLAY_FLOOR
      ? negativeCarry
      : 0
  const assetOut = inputNum * vaultStats.exchangeRate * (1 - carry)
  const isBelowMin = inputNum > 0 && inputNum < vaultStats.minRedeem
  const overBalance = inputNum > shareBalance

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
    redeem.mutate(inputNum)
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
            selectedAssetIcon={<AssetLogo id={assetId} size="medium" />}
            modalDisabled
            value={amount}
            onChange={setAmount}
            displayValue={t("common:currency", { value: assetOut })}
            maxBalance={shareBalance.toString()}
            maxButtonBalance={shareBalance.toString()}
            amountError={amountError}
          />
        </Box>

        {carry > 0 && !blockedReason && (
          <Box px="xl" pt="l">
            <Text fs="p6" color={getToken("text.low")}>
              {t("withdraw.carryEstimate", {
                carry,
              })}
            </Text>
          </Box>
        )}

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
