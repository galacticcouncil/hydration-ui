import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer, SOmnipoolButton } from "./LiquidityPosition.styled"
import { BN_0, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import BN from "bignumber.js"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import DropletIcon from "assets/icons/DropletIcon.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { SPositions } from "sections/pools/pool/Pool.styled"
import { RemoveLiquidityButton } from "sections/pools/stablepool/removeLiquidity/RemoveLiquidityButton"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import Skeleton from "react-loading-skeleton"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useDisplayPrice } from "utils/displayAsset"
import { Stablepool } from "sections/pools/PoolsPage.utils"
import { useRpcProvider } from "providers/rpcProvider"

type Props = {
  pool: Stablepool
  refetchPosition: () => void
  amount: BN
  onTransferOpen: () => void
  canAddLiquidity?: boolean
}

export const LiquidityPosition = ({
  pool,
  amount,
  refetchPosition,
  onTransferOpen,
  canAddLiquidity,
}: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const meta = assets.getAsset(pool.id.toString())
  const price = useDisplayPrice(pool.id)
  const spotPrice = price.data?.spotPrice
  const providedAmountPrice = spotPrice
    ? amount.multipliedBy(spotPrice).shiftedBy(-meta.decimals)
    : BN_0

  const providedAmountPriceLoading = price.isLoading

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
                icons={pool.assets.map((asset) => ({
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
                {providedAmountPriceLoading ? (
                  <Skeleton width={50} height={7} />
                ) : (
                  <DollarAssetValue
                    value={providedAmountPrice}
                    wrapper={(children) => (
                      <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                        {children}
                      </Text>
                    )}
                  >
                    <DisplayValue value={providedAmountPrice} />
                  </DollarAssetValue>
                )}
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
                {providedAmountPriceLoading ? (
                  <Skeleton width={50} height={7} />
                ) : (
                  <DollarAssetValue
                    value={providedAmountPrice}
                    wrapper={(children) => (
                      <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                        {children}
                      </Text>
                    )}
                  >
                    <DisplayValue value={providedAmountPrice} />
                  </DollarAssetValue>
                )}
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
            <SOmnipoolButton
              size="small"
              onClick={onTransferOpen}
              disabled={!canAddLiquidity}
            >
              <div sx={{ flex: "row", align: "center", justify: "center" }}>
                <Icon icon={<PlusIcon />} sx={{ mr: 8 }} />
                {t("liquidity.stablepool.addToOmnipool")}
              </div>
            </SOmnipoolButton>
            {/*reserves,
                fee,
                poolId,
                amount*/}
            <RemoveLiquidityButton onSuccess={refetchPosition} pool={pool} />
          </div>
        </SContainer>
      </div>
    </SPositions>
  )
}
