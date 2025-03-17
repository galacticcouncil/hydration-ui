import { DetailCard } from "sections/trade/sections/bonds/details/components/DetailCard/DetailCard"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useTranslation } from "react-i18next"
import { TBond, useAssets } from "providers/assets"
import { formatDate } from "utils/formatting"
import {
  isPoolLiquidityEvent,
  useHistoricalPoolBalance,
  useLBPAveragePrice,
  useLBPPoolEvents,
  useLbpPool,
} from "api/bonds"
import BN from "bignumber.js"
import { useTokenBalance } from "api/balances"
import { useSpotPrice } from "api/spotPrice"
import { Text } from "components/Typography/Text/Text"
import Skeleton from "react-loading-skeleton"
import { useAssetsPrice } from "state/displayPrice"

export const BondInfoCards = ({
  bond,
  poolId,
  lbpPool,
  removeBlock,
  isPast,
}: {
  bond: TBond
  poolId?: string
  removeBlock?: number
  lbpPool?: NonNullable<ReturnType<typeof useLbpPool>["data"]>[number]
  isPast?: boolean
}) => {
  const { t } = useTranslation()
  const { getAsset } = useAssets()
  const { getAssetPrice } = useAssetsPrice([bond.underlyingAssetId, bond.id])

  const lbpPoolEvents = useLBPPoolEvents(bond?.id)

  const hisroticalBalance = useHistoricalPoolBalance(
    poolId,
    removeBlock ? removeBlock - 1 : undefined,
  )

  const initialAccumulatedAsset = lbpPoolEvents.data?.events
    .filter(isPoolLiquidityEvent)
    .find((event) => event.name === "LBP.LiquidityAdded")?.args

  const averagePriceData = useLBPAveragePrice(
    poolId || initialAccumulatedAsset?.who,
  )

  const accumulatedAssetId = initialAccumulatedAsset?.assetA
  const initialAccumulatedAssetValue = initialAccumulatedAsset?.amountA

  const spotPriceAccumulated = useSpotPrice(
    bond.underlyingAssetId,
    accumulatedAssetId,
  )
  const spotPriceBondAccumulated = useSpotPrice(bond.id, accumulatedAssetId)

  const tokenBalance = useTokenBalance(
    lbpPool?.assets[0].toString(),
    lbpPool?.id,
  )

  const averagePrice = averagePriceData.data?.price

  const currentSpotPrice = getAssetPrice(bond.underlyingAssetId).price
  const currentBondPrice = getAssetPrice(bond.id).price

  const accumulatedAsset = accumulatedAssetId
    ? getAsset(accumulatedAssetId.toString())
    : undefined
  const accumulatedAssetBalance = isPast
    ? hisroticalBalance.data?.lbpPoolHistoricalData.nodes[0]?.assetABalance
    : undefined

  const currentAccumulatedAssetValue = removeBlock
    ? accumulatedAssetBalance
      ? BN(accumulatedAssetBalance).minus(initialAccumulatedAssetValue ?? 0)
      : undefined
    : BN(tokenBalance.data?.freeBalance ?? "0").minus(
        initialAccumulatedAssetValue ?? 0,
      )

  const isDiscount = BN(currentSpotPrice).gt(currentBondPrice)

  const discount = BN(currentSpotPrice)
    .minus(currentBondPrice)
    .div(currentSpotPrice)
    .multipliedBy(100)
    .absoluteValue()

  const cards = [
    isPast
      ? {
          label: t("bonds.table.price"),
          value: t("value.tokenWithSymbol", {
            value: averagePrice,
            symbol: accumulatedAsset?.symbol,
          }),
        }
      : {
          label: t("bonds.details.card.bondPrice"),
          value: (
            <div sx={{ flex: "column", gap: 4 }}>
              <Text fs={[13, 15]} lh={[13, 15]} color="white">
                <DisplayValue value={currentBondPrice} type="token" />
              </Text>
              {spotPriceBondAccumulated.isInitialLoading ? (
                <Skeleton height={16} width={40} />
              ) : (
                <Text fs={12} lh={12} color="basic400">
                  {t("value.tokenWithSymbol", {
                    value: spotPriceBondAccumulated.data?.spotPrice
                      ? BN(spotPriceBondAccumulated.data.spotPrice)
                      : undefined,
                    symbol: accumulatedAsset?.symbol,
                  })}
                </Text>
              )}
            </div>
          ),
        },

    ...(!isPast
      ? [
          {
            label: t("bonds.details.card.spotPrice", {
              symbol: getAsset(bond.underlyingAssetId)?.symbol,
            }),
            value: (
              <div sx={{ flex: "column", gap: 4 }}>
                <Text fs={[13, 15]} lh={[13, 15]} color="white">
                  <DisplayValue value={currentSpotPrice} type="token" />
                </Text>
                {spotPriceAccumulated.isInitialLoading ? (
                  <Skeleton height={16} width={40} />
                ) : (
                  <Text fs={12} lh={12} color="basic400">
                    {t("value.tokenWithSymbol", {
                      value: spotPriceAccumulated.data?.spotPrice
                        ? BN(spotPriceAccumulated.data.spotPrice)
                        : undefined,
                      symbol: accumulatedAsset?.symbol,
                    })}
                  </Text>
                )}
              </div>
            ),
          },
        ]
      : []),
    ...(!isPast
      ? [
          {
            label: isDiscount ? t("bonds.discount") : t("bonds.premium"),
            value: (
              <Text
                fs={[13, 15]}
                lh={[13, 15]}
                color={isDiscount ? "white" : "red300"}
                sx={{ mb: 6 }}
              >
                {t("value.percentage", { value: discount })}
              </Text>
            ),
            tooltip: isDiscount ? undefined : t("bonds.premium.desc"),
          },
        ]
      : []),
    {
      label: "Accumulated asset",
      value: t("value.tokenWithSymbol", {
        value: currentAccumulatedAssetValue,
        symbol: accumulatedAsset?.symbol,
        fixedPointScale: accumulatedAsset?.decimals,
      }),
    },

    {
      label: t("bonds.details.card.maturity"),
      value: formatDate(new Date(bond.maturity), "dd/MM/yyyy"),
    },
  ]

  return (
    <div sx={{ flex: ["column", "row"], gap: 14, flexWrap: "wrap" }}>
      {cards.map((card, i) => (
        <DetailCard
          key={i}
          label={card.label}
          value={card.value}
          tooltip={card.tooltip}
        />
      ))}
    </div>
  )
}
