import { Scale, ShieldCheck } from "@galacticcouncil/ui/assets/icons"
import {
  AssetInput,
  Box,
  Button,
  Flex,
  Icon,
  Paper,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { type ComponentType, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"

interface VaultStats {
  exchangeRate: number
  totalAssets: number
  tvlCap: number
  paused: boolean
  depositsPaused: boolean
}

interface Balances {
  eth: number
  shares: number
}

interface Props {
  vaultStats: VaultStats
  balances: Balances
  onDeposit: (amount: number) => void
  isPending: boolean
}

export const DepositPanel = ({
  vaultStats,
  balances,
  onDeposit,
  isPending,
}: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState("")
  const vault = useActivePropellerVault()

  const inputNum = parseFloat(amount) || 0
  const overBalance = inputNum > balances.eth

  // The contract reverts ExceedsTvlCap when totalAssets + assets > tvlCap, so
  // the exact headroom is tvlCap − totalAssets. A tvlCap of 0 is the "not read
  // yet" default rather than a real zero-capacity vault, so it doesn't gate.
  const remainingCapacity = Math.max(
    vaultStats.tvlCap - vaultStats.totalAssets,
    0,
  )
  const overCapacity = vaultStats.tvlCap > 0 && inputNum > remainingCapacity
  // deposit() is whenNotPaused on top of its own depositsPaused switch.
  const isPaused = vaultStats.depositsPaused || vaultStats.paused

  const handleSubmit = () => {
    if (
      !isConnected ||
      inputNum <= 0 ||
      overBalance ||
      overCapacity ||
      isPaused
    )
      return
    onDeposit(inputNum)
  }

  const ctaLabel = (() => {
    if (isPending) return t("deposit.cta.pending")
    if (isPaused) return t("deposit.cta.paused")
    if (overCapacity) return t("deposit.cta.exceedsCapacity")
    return t("deposit.cta.deposit")
  })()

  const amountError = overBalance
    ? t("withdraw.cta.insufficient")
    : overCapacity
      ? t("deposit.cta.exceedsCapacity")
      : undefined

  return (
    <Paper px="xl" position="relative">
      <Box>
        <AssetInput
          label={t("deposit.amount")}
          symbol={vault.symbol}
          selectedAssetIcon={<AssetLogo id={vault.assetId} size="medium" />}
          modalDisabled
          value={amount}
          onChange={setAmount}
          displayValue={t("common:currency", {
            value: inputNum,
          })}
          maxBalance={balances.eth.toString()}
          maxButtonBalance={balances.eth.toString()}
          amountError={amountError}
        />
      </Box>

      <Separator mx="-xl" />

      <Stack gap="base" py="xl">
        <BenefitRow
          icon={ShieldCheck}
          label={t("deposit.benefit.noLiquidations")}
          description={t("deposit.benefit.noLiquidationsDescription")}
        />
        <BenefitRow
          icon={Scale}
          label={t("deposit.benefit.noImpermanentLoss")}
          description={t("deposit.benefit.noImpermanentLossDescription")}
        />
      </Stack>

      <Separator mx="-xl" />

      <Box py="xl">
        <AuthorizedAction size="large" width="100%">
          <Button
            size="large"
            width="100%"
            disabled={
              inputNum <= 0 ||
              isPending ||
              overBalance ||
              overCapacity ||
              isPaused
            }
            onClick={handleSubmit}
          >
            {ctaLabel}
          </Button>
        </AuthorizedAction>
      </Box>
    </Paper>
  )
}

const BenefitRow = ({
  icon,
  label,
  description,
}: {
  icon: ComponentType
  label: string
  description: string
}) => {
  return (
    <Flex justify="space-between">
      <Flex gap="s" sx={{ color: getToken("text.tint.quart") }}>
        <Icon component={icon} size="s" />
        <Text
          fs="p5"
          fw={500}
          color={getToken("text.tint.quart")}
          whiteSpace="nowrap"
        >
          {label}
        </Text>
      </Flex>
      <Text fs="p5" fw={400} align="right">
        {description}
      </Text>
    </Flex>
  )
}
