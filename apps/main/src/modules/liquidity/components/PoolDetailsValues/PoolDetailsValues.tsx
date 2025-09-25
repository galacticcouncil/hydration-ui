import { pool } from "@galacticcouncil/sdk-next"
import {
  Flex,
  Paper,
  Separator,
  SValueStatsValue,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { PoolToken } from "@/api/pools"
import { AssetLogo } from "@/components/AssetLogo"
import {
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

  return (
    <Paper
      as={Flex}
      width={360}
      p={getTokenPx("containers.paddings.primary")}
      gap={getTokenPx("containers.paddings.primary")}
      sx={{ flexDirection: "column" }}
    >
      {isOmnipool ? (
        <OmnipoolValues data={data} />
      ) : (
        <IsolatedPoolValues data={data} />
      )}
    </Paper>
  )
}

const OmnipoolValues = ({ data }: { data: OmnipoolAssetTable }) => {
  const { t } = useTranslation(["common", "liquidity"])

  const { omnipoolShare, isLoading: isOmnipoolShareLoading } = useOmnipoolShare(
    data.id,
  )

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

      <Separator mx={-20} />

      <ValueStats
        label={t("liquidity:details.values.omnipoolShare")}
        value={t("percent", { value: omnipoolShare })}
        isLoading={isOmnipoolShareLoading}
        wrap
      />

      {data.stablepoolData && (
        <CurrencyReserves stablepoolData={data.stablepoolData} />
      )}
    </>
  )
}

const IsolatedPoolValues = ({ data }: { data: IsolatedPoolTable }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const [assetA, assetB] = data.tokens
  const [assetAIconId, assetBIconId] = data.meta.iconId

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
            customValue={
              <Flex gap={4} align="self-start">
                <AssetLogo id={assetAIconId} sx={{ mt: 4 }} />
                <Flex
                  direction="column"
                  gap={getTokenPx("scales.paddings.s")}
                  width="100%"
                >
                  <SValueStatsValue>
                    {t("currency", { value: priceA })}
                  </SValueStatsValue>
                  <Separator />
                  <AssetPrice asset={assetA} />
                </Flex>
              </Flex>
            }
          />
          <Separator mx={-20} />
        </>
      )}

      {assetBIconId && priceB && assetB && (
        <>
          <ValueStats
            customValue={
              <Flex gap={4} align="self-start">
                <AssetLogo id={assetBIconId} sx={{ mt: 4 }} />
                <Flex
                  direction="column"
                  gap={getTokenPx("scales.paddings.s")}
                  width="100%"
                >
                  <SValueStatsValue>
                    {t("currency", { value: priceB })}
                  </SValueStatsValue>
                  <Separator />
                  <AssetPrice asset={assetB} />
                </Flex>
              </Flex>
            }
          />
          <Separator mx={-20} />
        </>
      )}

      <ValueStats
        wrap
        label={t("liquidity:totalValueLocked")}
        value={t("currency", { value: data.tvlDisplay })}
      />

      <Separator mx={-20} />

      <ValueStats
        wrap
        label={t("liquidity:details.values.volume")}
        value={t("currency", { value: data.volumeDisplay })}
      />

      <Separator mx={-20} />

      <ValueStats
        wrap
        label={t("liquidity:details.values.feeFarmApr")}
        value={t("percent", { value: "5" })}
      />

      <Separator mx={-20} />
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
