import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer, SOmnipoolButton } from "./LiquidityPosition.styled"
import { STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import BN from "bignumber.js"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { u32 } from "@polkadot/types"
import DropletIcon from "assets/icons/DropletIcon.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { SPositions } from "sections/pools/pool/Pool.styled"
import { RemoveLiquidityButton } from "sections/pools/stablepool/removeLiquidity/RemoveLiquidityButton"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { TAsset } from "api/assetDetails"

type Props = {
  refetchPosition: () => void
  amount: BN
  poolId: u32
  fee: BN
  reserves: { asset_id: number; amount: string }[]
  onTransferOpen: () => void
  assets: TAsset[]
}

export const LiquidityPosition = ({
  amount,
  assets,
  poolId,
  fee,
  reserves,
  refetchPosition,
  onTransferOpen,
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
                  icon: <AssetLogo id={asset.id} />,
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
              gap: 8,
            }}
          >
            <SOmnipoolButton size="small" onClick={onTransferOpen}>
              <div sx={{ flex: "row", align: "center", justify: "center" }}>
                <Icon icon={<PlusIcon />} sx={{ mr: 8 }} />
                {t("liquidity.stablepool.addToOmnipool")}
              </div>
            </SOmnipoolButton>
            <RemoveLiquidityButton
              assets={assets}
              position={{
                reserves,
                fee,
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
