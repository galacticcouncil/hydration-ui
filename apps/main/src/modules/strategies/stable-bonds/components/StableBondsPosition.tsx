import {
  Box,
  Button,
  Flex,
  Paper,
  ResponsiveScope,
  Separator,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { differenceInMilliseconds } from "date-fns"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import {
  SActionColumn,
  SNameColumn,
  SRowContainer,
  SValuesColumn,
} from "@/modules/strategies/stable-bonds/components/StableBondsPosition.styled"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { otcTradeFeeQuery } from "@/modules/trade/otc/TradeFee.query"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalance, useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

const PositionRow = () => {
  const { t } = useTranslation(["common", "strategies"])
  const rpc = useRpcProvider()
  const { getAssetWithFallback, getBond, isBond } = useAssets()
  const { isBalanceLoading: isAccountBalanceLoading } = useAccountBalances()
  const config = useStableBondsConfig()

  const asset = getAssetWithFallback(config.bondId)
  const bondMeta = getBond(config.bondId)
  const balance = useAccountBalance(config.bondId)

  const { data: feePct = "0", isPending: isFeePending } = useQuery(
    otcTradeFeeQuery(rpc),
  )

  const balanceAmount = balance?.transferable ?? 0n
  const balanceHuman = scaleHuman(balanceAmount, asset.decimals)
  const underlyingAssetId = isBond(asset) ? asset.underlyingAssetId : ""
  const underlyingAsset = getAssetWithFallback(underlyingAssetId)
  const [balanceUsdDisplay] = useDisplayAssetPrice(
    underlyingAssetId,
    balanceHuman,
  )

  const maturityDate = bondMeta?.maturity
  const timeLeft =
    maturityDate && maturityDate > Date.now()
      ? differenceInMilliseconds(new Date(maturityDate), new Date())
      : 0

  return (
    <ResponsiveScope>
      <Paper p="l" shadow={false} bg="dim" borderRadius="m">
        <SRowContainer gap="l">
          <SNameColumn align="center" gap="s">
            <AssetLogo id={config.bondId} size="medium" />
            <Text fs="p3" fw={500} color={getToken("text.high")}>
              {asset.symbol}
            </Text>
          </SNameColumn>

          <SValuesColumn align="center" justify="space-between" gap="xxl" wrap>
            <ValueStats
              wrap
              size="small"
              font="secondary"
              label={t("strategies:bonds.position.value")}
              isLoading={isAccountBalanceLoading}
              customValue={
                <Text fs="p3" fw={500} lh={1}>
                  {t("currency", {
                    value: balanceHuman,
                    symbol: underlyingAsset.symbol,
                  })}
                </Text>
              }
              bottomLabel={balanceUsdDisplay}
            />
            {bondMeta && (
              <ValueStats
                wrap
                size="small"
                font="secondary"
                label={t("strategies:bonds.position.maturityDate")}
                customValue={
                  <Text fs="p3" fw={500} lh={1}>
                    {t("date.date", {
                      value: new Date(bondMeta.maturity),
                    })}
                  </Text>
                }
                bottomLabel={
                  timeLeft > 0
                    ? t("interval", {
                        value: timeLeft,
                        unit: "d",
                      })
                    : undefined
                }
              />
            )}
            <ValueStats
              wrap
              size="small"
              font="secondary"
              isLoading={isFeePending}
              customLabel={
                <Flex align="center" gap="xs">
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("apr")}
                  </Text>
                </Flex>
              }
              customValue={
                <Text
                  fs="p3"
                  fw={500}
                  lh={1}
                  color={getToken("accents.success.emphasis")}
                >
                  {t("percent", {
                    value: Big(config.apr).minus(Big(feePct).times(100)),
                    minimumFractionDigits: 1,
                  })}
                </Text>
              }
            />
          </SValuesColumn>

          <SActionColumn direction="column" align="flex-end" gap="xs">
            <Button variant="tertiary" size="small" disabled>
              {t("strategies:bonds.position.redeem")}
            </Button>
            <Text fs="p6" color={getToken("text.low")}>
              {t("strategies:bonds.position.availableAtMaturity")}
            </Text>
          </SActionColumn>
        </SRowContainer>
      </Paper>
    </ResponsiveScope>
  )
}

export const StableBondsPosition = () => {
  const { t } = useTranslation(["common", "strategies"])

  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("strategies:position.title")}
        </Text>
      </Box>
      <Separator />
      <Box p="m">
        <PositionRow />
      </Box>
    </Paper>
  )
}
