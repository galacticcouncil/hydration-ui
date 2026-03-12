import { Button, Flex, MicroButton, SectionHeader, Separator, SValueStatsValue, Text } from "@galacticcouncil/ui/components"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"

import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"

import { formatNumber, formatInputDisplay } from "../utils/format"
import {
  SStickyCard,
  STokenPill,
  STokenIcon,
  SArrowToggle,
  SExchangeRatePill,
} from "../WdclVault.styled"

interface VaultStats {
  totalAssets: number
  exchangeRate: number
  withdrawalDelayDays: number
  apr: number
  paused: boolean
  depositsPaused: boolean
  minDeposit: number
}

interface Balances {
  hollar: number
  wdcl: number
}

interface Props {
  vaultStats: VaultStats
  balances: Balances
  allowance: number
  onShowPositions: () => void
  onDeposit: (amount: number) => void
  onRequestRedeem: (amount: number) => void
  onApprove: (amount: number) => void
  isPending: boolean
}

export const OverviewPanel = ({
  vaultStats,
  balances,
  allowance,
  onShowPositions,
  onDeposit,
  onRequestRedeem,
  onApprove,
  isPending,
}: Props) => {
  const { isConnected } = useAccount()
  const [mode, setMode] = useState(0) // 0 = Invest, 1 = Withdraw
  const [inputAmount, setInputAmount] = useState("")
  const [priceReversed, setPriceReversed] = useState(false)

  const isInvest = mode === 0
  const inputNum = parseFloat(inputAmount) || 0

  const outputAmount = isInvest
    ? inputNum / vaultStats.exchangeRate
    : inputNum * vaultStats.exchangeRate

  const sellLabel = isInvest ? "HOLLAR" : "wDCL"
  const buyLabel = isInvest ? "wDCL" : "HOLLAR"
  const sellBalance = isInvest ? balances.hollar : balances.wdcl

  const isBelowMin = isInvest && inputNum > 0 && inputNum < vaultStats.minDeposit

  const handleSubmit = () => {
    if (!isConnected || inputNum <= 0 || isBelowMin) return

    if (isInvest) {
      if (allowance < inputNum) {
        onApprove(inputNum)
      } else {
        onDeposit(inputNum)
      }
    } else {
      onRequestRedeem(inputNum)
    }
  }

  const getButtonLabel = () => {
    if (isPending) return "Pending..."
    if (isBelowMin) return `Min. ${formatNumber(vaultStats.minDeposit, 0)} HOLLAR`
    if (isInvest && allowance < inputNum && inputNum > 0) return "Approve HOLLAR"
    return isInvest ? "Invest" : "Withdraw"
  }

  const hollarIcon = <AssetLogo id={HOLLAR_ASSET_ID} size="medium" />
  const wdclIcon = (
    <STokenIcon variant="wdcl">w</STokenIcon>
  )

  const sellIcon = isInvest ? hollarIcon : wdclIcon
  const buyIcon = isInvest ? wdclIcon : hollarIcon

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
      .replace(/\s+/g, "")
      .replace(/,/g, ".")
    if (raw === "" || !isNaN(Number(raw))) {
      setInputAmount(raw)
    }
  }

  return (
    <div>
      <SectionHeader title="wDCL Overview" noTopPadding />

      <SStickyCard>
        {/* Stats row */}
        <Flex justify="space-between">
          <Flex direction="column" gap={4}>
            <Text fs="p5" fw={600} color={getToken("text.low")} transform="uppercase">Total HOLLAR</Text>
            <Flex align="center" gap={6} css={{ cursor: "pointer" }} onClick={onShowPositions}>
              <SValueStatsValue size="large">
                {formatNumber(vaultStats.totalAssets, 0)}
              </SValueStatsValue>
              <Text fs="p5" color="accents.info.primary">↗</Text>
            </Flex>
          </Flex>
          <Flex direction="column" gap={4} align="flex-end">
            <Text fs="p5" fw={600} color={getToken("text.low")} transform="uppercase">APR</Text>
            <SValueStatsValue size="large" sx={{ color: "accents.success.emphasis" }}>
              {vaultStats.apr}%
            </SValueStatsValue>
          </Flex>
        </Flex>

        <Flex justify="space-between" sx={{ mt: "m" }}>
          <Text fs="p4" color={getToken("text.medium")}>Withdrawal period</Text>
          <Text fs="p4" fw={500} color={getToken("text.high")}>{vaultStats.withdrawalDelayDays} days</Text>
        </Flex>

        <Separator sx={{ my: "l" }} />

        {/* Tabs */}
        <Flex gap="m">
          <Button
            variant={mode === 0 ? "secondary" : "muted"}
            size="medium"
            onClick={() => { setMode(0); setInputAmount("") }}
          >
            Invest
          </Button>
          <Button
            variant={mode === 1 ? "secondary" : "muted"}
            size="medium"
            onClick={() => { setMode(1); setInputAmount("") }}
          >
            Withdraw
          </Button>
        </Flex>

        {/* Sell input */}
        <Flex direction="column" gap="m" css={{ marginTop: 16, overflow: "hidden" }}>
          <Flex justify="space-between" align="center">
            <Text
              fs="p5"
              fw={500}
              color={getToken("text.medium")}
              css={{ whiteSpace: "nowrap", lineHeight: "120%" }}
            >
              Sell
            </Text>
            <Flex align="center" gap="s" css={{ marginLeft: "auto" }}>
              <Text
                as="div"
                fs="p5"
                fw={500}
                color={getToken("text.low")}
                css={{ whiteSpace: "nowrap", lineHeight: "120%" }}
              >
                Balance: {formatNumber(sellBalance, 2)}
              </Text>
              <MicroButton
                aria-label="Max balance button"
                onClick={() => setInputAmount(sellBalance.toString())}
                disabled={sellBalance <= 0}
              >
                max
              </MicroButton>
            </Flex>
          </Flex>
          <Flex align="center" justify="space-between" gap="m" css={{ overflowX: "hidden" }}>
            <STokenPill>
              {sellIcon}
              <Text fs="p3" fw={600} color={getToken("text.high")} css={{ whiteSpace: "nowrap" }}>
                {sellLabel}
              </Text>
            </STokenPill>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={formatInputDisplay(inputAmount)}
              onChange={handleInputChange}
              placeholder="0"
              css={(theme: any) => ({
                background: "none",
                border: "none",
                outline: "none",
                textAlign: "right" as const,
                fontSize: theme.fontSizes?.p2 || "1.125rem",
                fontWeight: 500,
                fontFamily: "inherit",
                color: theme.text?.high || "#fff",
                width: "100%",
                padding: 0,
                height: "auto",
              })}
            />
          </Flex>
        </Flex>

        {/* Arrow + exchange rate */}
        <Flex align="center" css={{ margin: "8px -20px" }}>
          <Separator css={{ flexShrink: 0, width: 32 }} />
          <SArrowToggle onClick={() => { setMode(mode === 0 ? 1 : 0); setInputAmount("") }}>
            ↓
          </SArrowToggle>
          <Separator css={{ flex: 1 }} />
          <SExchangeRatePill
            css={{ cursor: "pointer" }}
            onClick={() => setPriceReversed((v) => !v)}
          >
            <Text fw={500} fs="p6" color={getToken("text.high")} css={{ whiteSpace: "nowrap" }}>
              {priceReversed
                ? `1 ${buyLabel} = ${formatNumber(isInvest ? vaultStats.exchangeRate : 1 / vaultStats.exchangeRate, 4)} ${sellLabel}`
                : `1 ${sellLabel} = ${formatNumber(isInvest ? 1 / vaultStats.exchangeRate : vaultStats.exchangeRate, 4)} ${buyLabel}`
              }
            </Text>
          </SExchangeRatePill>
          <Separator css={{ flexShrink: 0, width: 32 }} />
        </Flex>

        {/* Buy output */}
        <Flex direction="column" gap="m" css={{ overflow: "hidden" }}>
          <Flex justify="space-between" align="center">
            <Text
              fs="p5"
              fw={500}
              color={getToken("text.medium")}
              css={{ whiteSpace: "nowrap", lineHeight: "120%" }}
            >
              Buy
            </Text>
            <Text
              fs="p5"
              fw={500}
              color={getToken("text.low")}
              css={{ whiteSpace: "nowrap", lineHeight: "120%" }}
            >
              Balance: {formatNumber(isInvest ? balances.wdcl : balances.hollar, 2)}
            </Text>
          </Flex>
          <Flex align="center" justify="space-between" gap="m" css={{ overflowX: "hidden" }}>
            <STokenPill>
              {buyIcon}
              <Text fs="p3" fw={600} color={getToken("text.high")} css={{ whiteSpace: "nowrap" }}>
                {buyLabel}
              </Text>
            </STokenPill>
            <Text
              fs="p2"
              fw={500}
              color={getToken("text.low")}
              css={{ textAlign: "right" as const, width: "100%" }}
            >
              {inputNum > 0 ? formatNumber(outputAmount, 2) : "0"}
            </Text>
          </Flex>
        </Flex>

        {/* CTA */}
        <Separator sx={{ mx: "-20px", mt: "base" }} />
        <div css={{ marginTop: 16 }}>
          <AuthorizedAction size="large" width="100%">
            <Button
              size="large"
              width="100%"
              disabled={inputNum <= 0 || isPending || isBelowMin}
              onClick={handleSubmit}
            >
              {getButtonLabel()}
            </Button>
          </AuthorizedAction>
        </div>
      </SStickyCard>
    </div>
  )
}
