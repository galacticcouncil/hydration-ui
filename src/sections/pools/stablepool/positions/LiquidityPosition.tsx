import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import {
  SContainer,
} from "sections/pools/pool/positions/LiquidityPosition.styled"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { useAssetMeta } from "api/assetMeta"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { BN_10, BN_100 } from 'utils/constants'

export const LiquidityPosition = () => {
  const { t } = useTranslation()
  const meta = useAssetMeta("7")

  return (
    <SContainer>
      <div sx={{ flex: "column", gap: 24 }} css={{ flex: 1 }}>
        <div sx={{ flex: "row", gap: 7, align: "center" }}>
          <Icon
            icon={getAssetLogo(meta.data?.symbol)}
            sx={{ width: 18, height: "fit-content" }}
          />
        </div>
        <div css={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div sx={{ flex: "column", gap: 6 }}>
            <Text fs={14} color="whiteish500">
              {t("liquidity.asset.positions.position.initialValue")}
            </Text>
            <div>
              <Text>
                {t("value.token", {
                  value: BN_10,
                  fixedPointScale: meta.data?.decimals.toString() ?? 12,
                  numberSuffix: ` ${meta.data?.symbol ?? "N/A"}`,
                })}
              </Text>
              <DollarAssetValue
                value={BN_10}
                wrapper={(children) => (
                  <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                    {children}
                  </Text>
                )}
              >
                <DisplayValue value={BN_10} />
              </DollarAssetValue>
            </div>
          </div>
          <Separator orientation="vertical" />
          <div sx={{ flex: "column", gap: 6 }}>
            <div sx={{ display: "flex", gap: 6 }}>
              <Text fs={14} color="whiteish500">
                {t("liquidity.asset.positions.position.currentValue")}
              </Text>
            </div>
            <div sx={{ flex: "column", align: "start" }}>
              <DollarAssetValue
                value={BN_100}
                wrapper={(children) => (
                  <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                    {children}
                  </Text>
                )}
              >
                <DisplayValue value={BN_100} />
              </DollarAssetValue>
            </div>
          </div>
        </div>
      </div>
    </SContainer>
  )
}
