import { useBorrowAssetApy } from "api/borrow"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import { GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import BN from "bignumber.js"
import { Icon } from "components/Icon/Icon"
import { Heading } from "components/Typography/Heading/Heading"
import { SContainer } from "./GDOTIncentives.styled"

export const GDOTIncentives = () => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  return (
    <>
      <Heading
        color="white"
        fs={15}
        sx={{ mb: 5 }}
        font="GeistMono"
        tTransform="uppercase"
      >
        {t("liquidity.stablepool.incetives")}
      </Heading>
      <SContainer sx={{ flex: "row", gap: 6, justify: "space-between" }}>
        <div sx={{ flex: "row", gap: 6 }}>
          <Icon size={20} icon={<AssetLogo id={GDOT_STABLESWAP_ASSET_ID} />} />
          <Text fs={16} fw={600} color="basic100">
            {getAssetWithFallback(GDOT_STABLESWAP_ASSET_ID).symbol}
          </Text>
        </div>
        <GDOTAPY withLabel />
      </SContainer>
    </>
  )
}

export const GDOTAPY = ({ withLabel }: { withLabel?: boolean }) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const { apy, lpAPY, incentivesAPY, underlyingAssetsAPY } = useBorrowAssetApy(
    GDOT_STABLESWAP_ASSET_ID,
  )

  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }}>
      <Text color="white" fs={14} tTransform={withLabel ? "uppercase" : "none"}>
        {t(
          withLabel
            ? "liquidity.stablepool.incetives.value"
            : "value.percentage",
          { value: apy },
        )}
      </Text>
      <InfoTooltip
        preventDefault
        text={
          <>
            <Text fs={12}>{t("liquidity.table.farms.apr.description")}</Text>
            {BN(apy).gt(0) && (
              <div
                sx={{ flex: "row", gap: 4, justify: "space-between", mt: 6 }}
              >
                <Text fs={10} tTransform="uppercase" sx={{ opacity: 0.8 }}>
                  {t("liquidity.table.farms.apr.lpFee")}
                </Text>
                <Text fs={12} font="GeistSemiBold">
                  {t("value.percentage", { value: lpAPY })}
                </Text>
              </div>
            )}
            {[
              ...underlyingAssetsAPY,
              { apy: incentivesAPY, id: GDOT_STABLESWAP_ASSET_ID },
            ].map(({ id, apy }) => {
              return (
                <div
                  key={id}
                  sx={{
                    flex: "row",
                    gap: 4,
                    justify: "space-between",
                    mt: 6,
                  }}
                >
                  <div sx={{ flex: "row", gap: 4, align: "center" }}>
                    <Icon size={14} icon={<AssetLogo id={id} />} />
                    <Text fs={12}>{getAssetWithFallback(id).symbol}</Text>
                  </div>
                  <Text fs={12} font="GeistSemiBold">
                    {t("value.percentage", { value: apy })}
                  </Text>
                </div>
              )
            })}
          </>
        }
      />
    </div>
  )
}
