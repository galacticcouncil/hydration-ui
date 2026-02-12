import { pool } from "@galacticcouncil/sdk-next"
import {
  Flex,
  Separator,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { PoolToken } from "@/api/pools"
import { useXYKConsts } from "@/api/xyk"
import { AssetLogo } from "@/components/AssetLogo"
import {
  calculatePoolFee,
  isIsolatedPool,
  IsolatedPoolTable,
  OmnipoolAssetTable,
  useOmnipoolShare,
} from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useAssetPrice } from "@/states/displayAsset"
import { scale, scaleHuman } from "@/utils/formatting"

import { CurrencyReserves } from "./CurrencyReserves"
import { LiquidityLimit } from "./LiquidityLimit"

export const PoolDetailsValues = ({
  data,
}: {
  data: OmnipoolAssetTable | IsolatedPoolTable
}) => {
  const isOmnipool = !isIsolatedPool(data)

  if (!isOmnipool) {
    return (
      <PoolDetailsValuesContainer>
        <IsolatedPoolValues data={data} />
      </PoolDetailsValuesContainer>
    )
  } else if (data.stablepoolData) {
    return (
      <Flex direction="column" justify="space-between" gap="xxl">
        <PoolDetailsValuesContainer>
          <OmnipoolValues data={data} />
          <Separator mx={-20} />
        </PoolDetailsValuesContainer>

        <CurrencyReserves stablepoolData={data.stablepoolData} />
      </Flex>
    )
  } else {
    return (
      <PoolDetailsValuesContainer>
        <OmnipoolValues data={data} />
      </PoolDetailsValuesContainer>
    )
  }
}

const OmnipoolValues = ({ data }: { data: OmnipoolAssetTable }) => {
  const { t } = useTranslation(["common", "liquidity"])

  const displayOmnipoolShare = !data.isStablePool || data.isStablepoolInOmnipool

  return (
    <>
      {!data.isStablepoolOnly && (
        <>
          <LiquidityLimit poolId={data.id} />
          <Separator mx={-20} />
        </>
      )}

      <ValueStats
        label={t("liquidity:details.values.volume")}
        value={t("currency", { value: data.volumeDisplay })}
        wrap
      />

      <Separator mx={-20} />

      <ValueStats
        label={t("liquidity:totalValueLocked")}
        value={t("currency", { value: data.tvlDisplay })}
        wrap
      />

      <Separator mx={-20} />

      <ValueStats
        label={t("liquidity:details.values.feeFarmApr")}
        value={t("percent", { value: data.totalFee })}
        wrap
      />

      {displayOmnipoolShare && (
        <>
          <Separator mx={-20} />
          <OmnipoolShare id={data.id} />
        </>
      )}
    </>
  )
}

const OmnipoolShare = ({ id }: { id: string }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { omnipoolShare, isLoading: isOmnipoolShareLoading } =
    useOmnipoolShare(id)

  return (
    <ValueStats
      label={t("liquidity:details.values.omnipoolShare")}
      value={t("percent", { value: omnipoolShare })}
      isLoading={isOmnipoolShareLoading}
      wrap
    />
  )
}

const IsolatedPoolValues = ({ data }: { data: IsolatedPoolTable }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { getAssetWithFallback } = useAssets()
  const [assetA, assetB] = data.tokens
  const [assetAIconId, assetBIconId] = data.meta.iconId
  const { data: consts, isLoading: isConstsLoading } = useXYKConsts()

  const assetAMeta = getAssetWithFallback(assetA.id)
  const assetBMeta = getAssetWithFallback(assetB.id)

  const tradeFee = calculatePoolFee(consts?.fee)

  const priceA =
    assetA && assetB
      ? scaleHuman(
          pool.xyk.XykMath.getSpotPrice(
            assetA.balance.toString(),
            assetB.balance.toString(),
            scale(1, assetA.decimals ?? 0),
          ),
          assetB.decimals ?? 0,
        )
      : undefined

  const priceB =
    assetA && assetB
      ? scaleHuman(
          pool.xyk.XykMath.getSpotPrice(
            assetB.balance.toString(),
            assetA.balance.toString(),
            scale(1, assetB.decimals ?? 0),
          ),
          assetA.decimals ?? 0,
        )
      : undefined

  return (
    <>
      {assetAIconId && priceA && assetA && (
        <>
          <ValueStats
            wrap
            customValue={
              <Flex gap="s" align="self-start">
                <AssetLogo id={assetAIconId} sx={{ mt: [0, 2] }} />
                <Flex direction="column" gap="s" width="100%">
                  <Text
                    fs="h7"
                    fw={500}
                    color={getToken("text.high")}
                    font="primary"
                  >
                    {t("currency", { value: 1, symbol: assetAMeta.symbol })} ={" "}
                    {t("currency", {
                      value: priceA,
                      symbol: assetBMeta.symbol,
                    })}
                  </Text>
                  <Separator />
                  <AssetPrice asset={assetA} />
                </Flex>
              </Flex>
            }
          />
          <Separator mx="-xl" />
        </>
      )}

      {assetBIconId && priceB && assetB && (
        <>
          <ValueStats
            wrap
            customValue={
              <Flex gap="s" align="self-start">
                <AssetLogo id={assetBIconId} sx={{ mt: [0, 2] }} />
                <Flex direction="column" gap="s" width="100%">
                  <Text
                    fs="h7"
                    fw={500}
                    color={getToken("text.high")}
                    font="primary"
                  >
                    {t("currency", { value: 1, symbol: assetBMeta.symbol })} ={" "}
                    {t("currency", {
                      value: priceB,
                      symbol: assetAMeta.symbol,
                    })}
                  </Text>
                  <Separator />
                  <AssetPrice asset={assetB} />
                </Flex>
              </Flex>
            }
          />
          <Separator mx="-xl" />
        </>
      )}

      <ValueStats
        wrap
        label={t("liquidity:totalValueLocked")}
        value={t("currency", { value: data.tvlDisplay })}
      />

      <Separator mx="-xl" />

      <ValueStats
        wrap
        label={t("liquidity:details.values.volume")}
        value={t("currency", { value: data.volumeDisplay })}
      />

      <Separator mx="-xl" />

      <ValueStats
        wrap
        label={t("liquidity:details.values.feeFarmApr")}
        isLoading={isConstsLoading}
        value={t("percent", {
          value: Big(tradeFee ?? 0)
            .plus(data?.totalApr ?? 0)
            .toString(),
        })}
      />

      <Separator mx="-xl" />
    </>
  )
}

const AssetPrice = ({ asset }: { asset: PoolToken }) => {
  const { t } = useTranslation("liquidity")
  const { getAssetWithFallback } = useAssets()
  const { price } = useAssetPrice(asset.id.toString())

  return (
    <Text fs="p6" fw={400} color={getToken("text.medium")}>
      {t("details.values.xyk.price", {
        value: price,
        priceSymbol: getAssetWithFallback(asset.id).symbol,
      })}
    </Text>
  )
}

const PoolDetailsValuesContainer = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <Flex
      direction="column"
      minWidth="16.25rem"
      maxWidth={["none", "none", "22.5rem"]}
      gap="xl"
    >
      {children}
    </Flex>
  )
}
