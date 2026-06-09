import { Hourglass, Lock, Zap } from "@galacticcouncil/ui/assets/icons"
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
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { HdclExchangeRate } from "@/modules/strategies/hdcl/components/HdclExchangeRate"
import { HdclLogo } from "@/modules/strategies/hdcl/components/HdclLogo"
import { useAssets } from "@/providers/assetsProvider"

interface VaultStats {
  exchangeRate: number
  /** Max lockup a *new* deposit can face. Drives "up to N days" copy. */
  maxLockupDays: number
  minDeposit: number
  depositsPaused: boolean
}

interface Balances {
  hollar: number
  hdcl: number
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
  const { t } = useTranslation(["strategies", "common"])
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState("")
  const { getAssetWithFallback } = useAssets()
  const hollar = getAssetWithFallback(HOLLAR_ASSET_ID)

  const inputNum = parseFloat(amount) || 0
  const outputHdcl =
    vaultStats.exchangeRate > 0 ? inputNum / vaultStats.exchangeRate : 0
  const isBelowMin = inputNum > 0 && inputNum < vaultStats.minDeposit
  const overBalance = inputNum > balances.hollar

  /*   const [debouncedAmount] = useDebounce(inputNum, 250)
  const { data: previewHdcl } = usePreviewDeposit(debouncedAmount)
  const totalFeesUsd =
    previewHdcl !== undefined && debouncedAmount > 0
      ? Math.max(0, debouncedAmount - previewHdcl * vaultStats.exchangeRate)
      : undefined */

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
    if (vaultStats.depositsPaused) return t("hdcl.deposit.cta.paused")
    if (isBelowMin)
      return t("hdcl.deposit.cta.belowMin", {
        value: vaultStats.minDeposit,
        symbol: hollar.symbol,
      })
    return t("common:deposit")
  })()

  const amountError = overBalance
    ? t("hdcl.withdraw.cta.insufficient")
    : isBelowMin
      ? t("hdcl.deposit.cta.belowMin", {
          value: vaultStats.minDeposit,
          symbol: hollar.symbol,
        })
      : undefined

  return (
    <Paper px="xl" position="relative">
      <Box>
        <AssetInput
          label={t("hdcl.deposit.your")}
          symbol="HOLLAR"
          selectedAssetIcon={<AssetLogo id={HOLLAR_ASSET_ID} size="medium" />}
          modalDisabled
          value={amount}
          onChange={setAmount}
          displayValue={t("common:currency", {
            value: inputNum,
          })}
          maxBalance={balances.hollar.toString()}
          maxButtonBalance={balances.hollar.toString()}
          amountError={amountError}
        />

        <HdclExchangeRate exchangeRate={vaultStats.exchangeRate} />

        <AssetInput
          label={t("hdcl.deposit.youReceive")}
          symbol="HDCL"
          selectedAssetIcon={<HdclLogo size={24} />}
          modalDisabled
          disabledInput
          ignoreBalance
          value={outputHdcl.toString()}
          displayValue={t("common:currency", {
            value: outputHdcl * vaultStats.exchangeRate,
          })}
        />
      </Box>

      <Separator mx="-xl" />

      <Summary separator={<Separator mx="-xl" />}>
        <SummaryRow
          label={
            <Flex align="center" gap="base">
              <Icon component={Lock} size="xs" />
              <Text fs="p5">{t("hdcl.deposit.lockup")}</Text>
            </Flex>
          }
          content={t("hdcl.deposit.lockupValue", {
            days: vaultStats.maxLockupDays,
          })}
        />
        <Box>
          <Text fs="p5" color={getToken("text.medium")} pt="m" pb="s">
            {t("hdcl.deposit.redeemOptions")}:
          </Text>
          <SummaryRow
            label={
              <Flex
                align="center"
                gap="base"
                sx={{ color: getToken("text.tint.secondary") }}
              >
                <Icon component={Hourglass} size="xs" />
                <Text fs="p5" fw={500} color={getToken("text.tint.secondary")}>
                  {t("hdcl.deposit.option.queue")}
                </Text>
              </Flex>
            }
            content={t("hdcl.deposit.option.queueValue", {
              days: vaultStats.maxLockupDays,
            })}
          />
        </Box>
        <SummaryRow
          label={
            <Flex
              align="center"
              gap="base"
              sx={{ color: getToken("accents.success.emphasis") }}
            >
              <Icon component={Zap} size="xs" />
              <Text
                fs="p5"
                fw={500}
                color={getToken("accents.success.emphasis")}
              >
                {t("hdcl.deposit.option.instant")}
              </Text>
            </Flex>
          }
          content={t("hdcl.deposit.option.instantValue")}
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

      {/*   {totalFeesUsd !== undefined && (
        <>
          <Box mt="-base" pb="basse">
            <Collapsible
              label={
                <Flex align="center" gap="s">
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("hdcl.deposit.totalFees")}
                  </Text>
                  <Text fs="p5" fw={500} color={getToken("text.high")}>
                    {t("common:currency", { value: totalFeesUsd })}
                  </Text>
                </Flex>
              }
              actionLabel={t("common:show")}
              actionLabelWhenOpen={t("common:hide")}
            >
              <Stack gap="base" pt="s">
                <Flex justify="space-between" align="center">
                  <Text fs="p6" color={getToken("text.medium")}>
                    {t("hdcl.deposit.totalFees")}
                  </Text>
                  <Text fs="p6" fw={500} color={getToken("text.high")}>
                    {t("common:currency", { value: totalFeesUsd })}
                  </Text>
                </Flex>
              </Stack>
            </Collapsible>
          </Box>
        </>
      )} */}
    </Paper>
  )
}
