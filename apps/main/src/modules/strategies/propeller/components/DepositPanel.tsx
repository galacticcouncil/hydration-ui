import { Hourglass } from "@galacticcouncil/ui/assets/icons"
import {
  AssetInput,
  Box,
  Button,
  Flex,
  Icon,
  Paper,
  Separator,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { PropellerExchangeRate } from "@/modules/strategies/propeller/components/PropellerExchangeRate"
import { PropellerLogo } from "@/modules/strategies/propeller/components/PropellerLogo"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"
import { useAssets } from "@/providers/assetsProvider"

interface VaultStats {
  exchangeRate: number
  minDeposit: number
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
  const { getAssetWithFallback } = useAssets()
  const vault = useActivePropellerVault()
  const eth = getAssetWithFallback(vault.assetId)

  const inputNum = parseFloat(amount) || 0
  // shares = assets / exchangeRate (exchangeRate is ETH per pETH).
  const outputShares =
    vaultStats.exchangeRate > 0 ? inputNum / vaultStats.exchangeRate : 0
  const isBelowMin = inputNum > 0 && inputNum < vaultStats.minDeposit
  const overBalance = inputNum > balances.eth

  const handleSubmit = () => {
    if (
      !isConnected ||
      inputNum <= 0 ||
      isBelowMin ||
      overBalance ||
      vaultStats.depositsPaused
    )
      return
    onDeposit(inputNum)
  }

  const ctaLabel = (() => {
    if (isPending) return t("deposit.cta.pending")
    if (vaultStats.depositsPaused) return t("deposit.cta.paused")
    if (isBelowMin)
      return t("deposit.cta.belowMin", {
        value: vaultStats.minDeposit,
        symbol: eth.symbol,
      })
    return t("deposit.cta.deposit")
  })()

  const amountError = overBalance
    ? t("withdraw.cta.insufficient")
    : isBelowMin
      ? t("deposit.cta.belowMin", {
          value: vaultStats.minDeposit,
          symbol: eth.symbol,
        })
      : undefined

  return (
    <Paper px="xl" position="relative">
      <Box>
        <AssetInput
          label={t("deposit.your")}
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

        <PropellerExchangeRate exchangeRate={vaultStats.exchangeRate} />

        <AssetInput
          label={t("deposit.youReceive")}
          symbol={vault.shareSymbol}
          selectedAssetIcon={<PropellerLogo size={24} />}
          modalDisabled
          disabledInput
          ignoreBalance
          value={outputShares.toString()}
          displayValue={t("common:currency", {
            value: outputShares * vaultStats.exchangeRate,
          })}
        />
      </Box>

      <Separator mx="-xl" />

      <Summary separator={<Separator mx="-xl" />}>
        <SummaryRow
          label={
            <Flex
              align="center"
              gap="base"
              sx={{ color: getToken("text.tint.secondary") }}
            >
              <Icon component={Hourglass} size="xs" />
              <Text fs="p5" fw={500} color={getToken("text.tint.secondary")}>
                {t("deposit.option.queue")}
              </Text>
            </Flex>
          }
          content={t("deposit.option.queueValue")}
        />
      </Summary>

      <Separator mx="-xl" />

      <Box py="xl">
        <AuthorizedAction size="large" width="100%">
          <Button
            size="large"
            width="100%"
            disabled={
              inputNum <= 0 ||
              isPending ||
              isBelowMin ||
              overBalance ||
              vaultStats.depositsPaused
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
