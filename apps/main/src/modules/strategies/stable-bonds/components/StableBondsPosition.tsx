import {
  Box,
  Button,
  Flex,
  Paper,
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
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { otcTradeFeeQuery } from "@/modules/trade/otc/TradeFee.query"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalance, useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

export const StableBondsPosition = () => {
  const { t } = useTranslation(["common"])
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
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          My positions
        </Text>
      </Box>
      <Separator />
      <Box p="m">
        <Paper p="l" shadow={false}>
          <Flex align="center" gap="l" wrap>
            <Flex align="center" gap="s" minWidth={120}>
              <AssetLogo id={config.bondId} size="medium" />
              <Text fs="p3" fw={500} color={getToken("text.high")}>
                {asset.symbol}
              </Text>
            </Flex>

            <Flex
              align="center"
              justify="space-around"
              gap="xxl"
              px="xl"
              flex={1}
              sx={{ minWidth: 0 }}
            >
              <ValueStats
                wrap
                size="small"
                font="secondary"
                label="Value"
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
                  label="Maturity date"
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
                      APR
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
            </Flex>

            <Flex direction="column" align="flex-end" gap="xs" minWidth={140}>
              <Button variant="tertiary" size="small" disabled>
                Redeem
              </Button>
              <Text fs="p6" color={getToken("text.low")}>
                Available at maturity
              </Text>
            </Flex>
          </Flex>
        </Paper>
      </Box>
    </Paper>
  )
}
