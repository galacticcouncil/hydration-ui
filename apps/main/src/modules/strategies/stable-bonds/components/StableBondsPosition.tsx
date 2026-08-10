import {
  Box,
  Paper,
  PositionCard,
  Separator,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { millisecondsInDay } from "date-fns/constants"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { AssetLogo } from "@/components/AssetLogo"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { BondRedeemButton } from "@/components/BondRedeemButton"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

const PositionRow = () => {
  const { t } = useTranslation(["common", "strategies"])
  const config = useStableBondsConfig()

  const { getAssetWithFallback, isBond } = useAssets()
  const { isBalanceLoading: isAccountBalanceLoading } = useAccountBalances()
  const { balance, maturity, timeLeft, isMatured } = useBondData(config.bondId)

  const asset = getAssetWithFallback(config.bondId)

  const balanceHuman = scaleHuman(balance, asset.decimals)
  const underlyingAssetId = isBond(asset) ? asset.underlyingAssetId : ""
  const underlyingAsset = getAssetWithFallback(underlyingAssetId)
  const [balanceUsdDisplay] = useDisplayAssetPrice(
    underlyingAssetId,
    balanceHuman,
  )

  return (
    <PositionCard
      logo={<AssetLogo id={config.bondId} size="medium" />}
      symbol={asset.symbol}
      stats={
        <>
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
          {maturity > 0 && (
            <ValueStats
              wrap
              size="small"
              font="secondary"
              label={t("strategies:bonds.position.maturityDate")}
              customValue={
                <Text fs="p3" fw={500} lh={1}>
                  {t("date.date", {
                    value: new Date(maturity),
                  })}
                </Text>
              }
              bottomLabel={
                timeLeft > 0
                  ? t("interval.remaining", {
                      value: timeLeft,
                      largest: 1,
                      ...(timeLeft > millisecondsInDay && { unit: "d" }),
                    })
                  : undefined
              }
            />
          )}
        </>
      }
      cta={
        <>
          <BondRedeemButton bondId={config.bondId} />
          {!isMatured && (
            <Text fs="p6" color={getToken("text.low")}>
              {t("strategies:bonds.position.availableAtMaturity")}
            </Text>
          )}
        </>
      }
    />
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
