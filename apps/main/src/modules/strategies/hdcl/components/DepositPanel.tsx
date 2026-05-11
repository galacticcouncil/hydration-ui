import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Hourglass, Lock, Zap } from "@galacticcouncil/ui/assets/icons"
import {
  AssetInput,
  Box,
  Button,
  Chip,
  Flex,
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
import { HdclLogo } from "@/modules/strategies/hdcl/components/HdclLogo"
import { useAssets } from "@/providers/assetsProvider"

const SDepositContainer = styled(Paper)(
  ({ theme }) => css`
    --deposit-section-padding-inline: ${theme.containers.paddings.primary};
    --deposit-section-inset-inline: calc(
      var(--deposit-section-padding-inline) * -1
    );

    padding: 0 var(--deposit-section-padding-inline);
    overflow-x: hidden;
  `,
)

const SPriceChipWrap = styled(Flex)`
  position: relative;
  justify-content: center;
  z-index: 1;
  align-items: center;
  margin-inline: -${({ theme }) => theme.space.xl};
`

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
  const { t } = useTranslation(["hdcl", "common"])
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
    if (isPending) return t("deposit.cta.pending")
    if (vaultStats.depositsPaused) return t("deposit.cta.paused")
    if (isBelowMin)
      return t("deposit.cta.belowMin", {
        value: vaultStats.minDeposit,
        currency: hollar.symbol,
      })
    return t("deposit.cta.deposit")
  })()

  const amountError = overBalance
    ? t("withdraw.cta.insufficient")
    : isBelowMin
      ? t("deposit.cta.belowMin", {
          value: vaultStats.minDeposit,
          currency: hollar.symbol,
        })
      : undefined

  return (
    <SDepositContainer>
      <Box pt="l">
        <AssetInput
          label={t("deposit.your")}
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

        <SPriceChipWrap>
          <Separator sx={{ flex: 1 }} />
          <Chip size="small" rounded variant="tertiary">
            <Text fs="p6" color={getToken("text.medium")}>
              {t("deposit.price", {
                rate: vaultStats.exchangeRate,
              })}
            </Text>
          </Chip>
          <Separator sx={{ width: "xl" }} />
        </SPriceChipWrap>

        <AssetInput
          label={t("deposit.youReceive")}
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

      <Box>
        <Summary separator={<Separator mx="-xl" />}>
          <SummaryRow
            label={
              <Flex align="center" gap="base">
                <Lock size={14} />
                <Text fs="p5">{t("deposit.lockup")}</Text>
              </Flex>
            }
            content={t("deposit.lockupValue", {
              days: vaultStats.maxLockupDays,
            })}
          />
          <Box>
            <Text fs="p5" color={getToken("text.medium")} pt="m" pb="s">
              {t("deposit.redeemOptions")}:
            </Text>
            <SummaryRow
              label={
                <Flex
                  align="center"
                  gap="base"
                  sx={{ color: getToken("text.tint.secondary") }}
                >
                  <Hourglass size={14} />
                  <Text
                    fs="p5"
                    fw={500}
                    color={getToken("text.tint.secondary")}
                  >
                    {t("deposit.option.queue")}
                  </Text>
                </Flex>
              }
              content={t("deposit.option.queueValue", {
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
                <Zap size={14} />
                <Text
                  fs="p5"
                  fw={500}
                  color={getToken("accents.success.emphasis")}
                >
                  {t("deposit.option.instant")}
                </Text>
              </Flex>
            }
            content={t("deposit.option.instantValue")}
          />
        </Summary>
      </Box>

      <Separator mx="-xl" />

      <Box py="xl">
        <AuthorizedAction size="large">
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
                    {t("deposit.totalFees")}
                  </Text>
                  <Text fs="p5" fw={500} color={getToken("text.high")}>
                    {t("common:currency", { value: totalFeesUsd })}
                  </Text>
                </Flex>
              }
              actionLabel={t("deposit.feesShow")}
              actionLabelWhenOpen={t("deposit.feesHide")}
            >
              <Stack gap="base" pt="s">
                <Flex justify="space-between" align="center">
                  <Text fs="p6" color={getToken("text.medium")}>
                    {t("deposit.totalFees")}
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
    </SDepositContainer>
  )
}
