import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer } from "./LiquidityPosition.styled"
import { STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import BN from "bignumber.js"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { u32, u8 } from "@polkadot/types"
import { ReactComponent as DropletIcon } from "assets/icons/DropletIcon.svg"
import { SPositions } from "sections/pools/pool/Pool.styled"
import { RemoveLiquidityButton } from "sections/pools/stablepool/removeLiquidity/RemoveLiquidityButton"

type Props = {
  refetchPosition: () => void
  amount: BN
  poolId: u32
  withdrawFee: BN
  reserves: { asset_id: number; amount: string }[]
  assets: {
    id: string
    symbol: string
    decimals: u8 | u32
  }[]
}

export const LiquidityPosition = ({
  amount,
  assets,
  poolId,
  withdrawFee,
  reserves,
  refetchPosition,
}: Props) => {
  const { t } = useTranslation()

  return (
    <SPositions>
      <div sx={{ flex: "row", align: "center", gap: 8, mb: 20 }}>
        <Icon
          size={15}
          sx={{ color: "vibrantBlue200" }}
          icon={<DropletIcon />}
        />
        <Text fs={[16, 16]} color="vibrantBlue200">
          {t("liquidity.stablepool.asset.positions.title")}
        </Text>
      </div>
      <div sx={{ flex: "column", gap: 16 }}>
        <SContainer>
          <div sx={{ flex: "column", gap: 24 }} css={{ flex: 1 }}>
            <div sx={{ flex: "row", gap: 7, align: "center" }}>
              <MultipleIcons
                size={15}
                icons={assets.map((asset) => ({
                  icon: getAssetLogo(asset.symbol),
                }))}
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
                    numberSuffix: ` ${t(
                      "liquidity.stablepool.position.token",
                    )}`,
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
              </div>
            </div>
          </div>
          <div
            sx={{
              flex: "column",
              align: "end",
              height: "100%",
              justify: "center",
            }}
          >
            <RemoveLiquidityButton
              assets={assets}
              position={{
                reserves,
                withdrawFee,
                poolId,
                amount,
              }}
              onSuccess={refetchPosition}
            />
          </div>
        </SContainer>
      </div>
    </SPositions>
  )
}
