import { PoolToken, XykMath } from "@galacticcouncil/sdk"
import {
  Flex,
  ProgressBar,
  Separator,
  Skeleton,
  SValueStatsValue,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components/Logo"
import {
  isIsolatedPool,
  IsolatedPoolTable,
  OmnipoolAssetTable,
  useOmnipoolCapacity,
} from "@/modules/liquidity/Liquidity.utils"
import { useAssetPrice } from "@/states/displayAsset"
import { scale, scaleHuman } from "@/utils/formatting"

import { CurrencyReserves } from "./CurrencyReserves"

export const PoolDetailsValues = ({
  data,
}: {
  data: OmnipoolAssetTable | IsolatedPoolTable
}) => {
  const isOmnipool = !isIsolatedPool(data)

  return (
    <>
      {isOmnipool ? (
        <OmnipoolValues data={data} />
      ) : (
        <IsolatedPoolValues data={data} />
      )}
    </>
  )
}

const OmnipoolValues = ({ data }: { data: OmnipoolAssetTable }) => {
  const { t } = useTranslation(["common", "liquidity"])

  const { data: capacity, isLoading } = useOmnipoolCapacity(data.id)

  return (
    <>
      <Flex direction="column">
        <Text
          font="primary"
          fw={700}
          fs={14}
          lh="130%"
          color={getToken("text.tint.secondary")}
          sx={{ pb: getTokenPx("containers.paddings.primary") }}
        >
          {t("liquidity:details.values.liquidityLimit")}
        </Text>

        <ProgressBar
          value={Number(capacity?.filledPercent ?? 0)}
          size="large"
          orientation="vertical"
          format={() =>
            `${t("number.compact", { value: capacity?.filled })} / ${t("number.compact", { value: capacity?.capacity })}`
          }
          customLabel={isLoading ? <Skeleton width={100} /> : undefined}
        />
      </Flex>

      <Separator mx={-20} />

      <ValueStats
        label={t("liquidity:details.values.volume")}
        value={t("currency", { value: "10000000000" })}
      />

      <Separator mx={-20} />

      <ValueStats
        label={t("liquidity:details.values.tvl")}
        value={t("currency", { value: data.tvlDisplay })}
      />

      <Separator mx={-20} />

      <ValueStats
        label={t("liquidity:details.values.feeFarmApr")}
        value={t("percent", { value: "5" })}
      />

      <Separator mx={-20} />

      <ValueStats
        label={t("liquidity:details.values.omnipoolShare")}
        value={t("percent", { value: 10 })}
      />

      {data.isStablePool && <CurrencyReserves id={data.id} />}
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
          XykMath.getSpotPrice(
            assetA.balance,
            assetB.balance,
            scale(1, assetA.decimals),
          ),
          assetB.decimals,
        )
      : undefined

  const priceB =
    assetA && assetB
      ? scaleHuman(
          XykMath.getSpotPrice(
            assetB.balance,
            assetA.balance,
            scale(1, assetB.decimals),
          ),
          assetA.decimals,
        )
      : undefined

  return (
    <>
      {assetAIconId && priceA && assetA && (
        <>
          <ValueStats
            customValue={
              <Flex gap={4} align="self-start">
                <Logo id={assetAIconId} sx={{ mt: 4 }} />
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
                <Logo id={assetBIconId} sx={{ mt: 4 }} />
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
        label={t("liquidity:details.values.tvl")}
        value={t("currency", { value: data.tvlDisplay })}
      />

      <Separator mx={-20} />

      <ValueStats
        label={t("liquidity:details.values.volume")}
        value={t("currency", { value: "10000000000" })}
      />

      <Separator mx={-20} />

      <ValueStats
        label={t("liquidity:details.values.feeFarmApr")}
        value={t("percent", { value: "5" })}
      />

      <Separator mx={-20} />
    </>
  )
}

const AssetPrice = ({ asset }: { asset: PoolToken }) => {
  const { t } = useTranslation("liquidity")
  const { price } = useAssetPrice(asset.id)

  return (
    <Text fs="p6" fw={400} color={getToken("text.medium")}>
      {t("details.values.xyk.price", {
        value: price,
        priceSymbol: asset.symbol,
      })}
    </Text>
  )
}
