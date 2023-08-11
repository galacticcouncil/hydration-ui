import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer } from "./LiquidityPosition.styled"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { BN_100, STABLEPOOL_TOKEN_DECIMALS } from 'utils/constants'
import BN from 'bignumber.js'
import { MultipleIcons } from 'components/MultipleIcons/MultipleIcons'
import { u32, u8 } from '@polkadot/types'

type Props = {
  amount: BN
  assets: {
    id: string
    symbol: string
    decimals: u8 | u32
  }[]
}

export const LiquidityPosition = ({ amount, assets }: Props) => {
  const { t } = useTranslation()

  return (
    <SContainer>
      <div sx={{ flex: "column", gap: 24 }} css={{ flex: 1 }}>
        <div sx={{ flex: "row", gap: 7, align: "center" }}>
          <MultipleIcons
            size={15}
            icons={assets.map((asset) => ({ icon: getAssetLogo(asset.symbol) }))}
          />
          <Text fs={18} color="white">
            {t("liquidity.stablepool.position.title")}
          </Text>
        </div>
        <div css={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div sx={{ flex: "column", gap: 6 }}>
            <Text fs={14} color="whiteish500">
              {t("liquidity.stablepool.position.amount")}
            </Text>
            <Text>
              {t("value.token", {
                value: amount,
                fixedPointScale: STABLEPOOL_TOKEN_DECIMALS,
                numberSuffix: ` ${t('liquidity.stablepool.position.token')}`,
              })}
            </Text>
          </div>
          <Separator orientation="vertical" />
          <div sx={{ flex: "column", gap: 6 }}>
            <div sx={{ display: "flex", gap: 6 }}>
              <Text fs={14} color="whiteish500">
                {t("liquidity.asset.positions.position.currentValue")}
              </Text>
            </div>
            <Text>
              {t("value.token", {
                value: amount,
                fixedPointScale: STABLEPOOL_TOKEN_DECIMALS,
              })}
            </Text>
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
