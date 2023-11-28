import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer } from "sections/pools/pool/positions/LiquidityPosition.styled"
import LiquidityIcon from "assets/icons/WaterRippleIcon.svg?react"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { TXYKPool } from "sections/pools/PoolsPage.utils"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { useRpcProvider } from "providers/rpcProvider"
import { TAsset } from "api/assetDetails"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Separator } from "components/Separator/Separator"
import { useMemo } from "react"
import { useTokensBalances } from "api/balances"
import { useDisplayPrices } from "utils/displayAsset"
import { SPositions } from "sections/pools/pool/Pool.styled"
import { LiquidityPositionRemoveLiquidity } from "sections/pools/pool/positions/LiquidityPosition"

export const XYKPosition = ({ pool }: { pool: TXYKPool }) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const assetsMeta = assets.getAssets(pool.assets)

  const [assetMetaA, assetMetaB] = assetsMeta

  const [{ data: assetAReserve }, { data: assetBReserve }] = useTokensBalances(
    [assetMetaA.id, assetMetaB.id],
    pool.poolAddress,
  )
  const spotPrices = useDisplayPrices(assetsMeta.map((asset) => asset.id))

  const myBalance = useMemo(() => {
    if (
      pool.shareTokenIssuance?.myPoolShare &&
      pool.totalDisplay &&
      assetAReserve &&
      assetBReserve &&
      spotPrices.data
    ) {
      const myBalanceA = pool.shareTokenIssuance.myPoolShare
        .times(assetAReserve.freeBalance)
        .div(100)
        .shiftedBy(-assetMetaA.decimals)

      const myBalanceB = pool.shareTokenIssuance.myPoolShare
        .times(assetBReserve.freeBalance)
        .div(100)
        .shiftedBy(-assetMetaB.decimals)
      /*
      const spotPriceA = spotPrices.data.find(
        (spotPrice) => spotPrice?.tokenIn === assetMetaA.id,
      )

      const spotPriceB = spotPrices.data.find(
        (spotPrice) => spotPrice?.tokenIn === assetMetaB.id,
      )

      const myBalanceADisplay = myBalanceA.times(spotPriceA?.spotPrice ?? 1)
      const myBalanceBDisplay = myBalanceB.times(spotPriceB?.spotPrice ?? 1)

      const totalDisplay = myBalanceADisplay.plus(myBalanceBDisplay)
*/
      const totalDisplay = pool.totalDisplay
        .div(100)
        .times(pool.shareTokenIssuance?.myPoolShare ?? 1)

      return { myBalanceA, myBalanceB, totalDisplay }
    }
    return undefined
  }, [
    assetAReserve,
    assetBReserve,
    assetMetaA.decimals,
    assetMetaB.decimals,
    pool.shareTokenIssuance?.myPoolShare,
    pool.totalDisplay,
    spotPrices.data,
  ])

  return (
    <SPositions sx={{ flex: "column", gap: 18, p: ["20px 12px", "20px 30px"] }}>
      <div sx={{ flex: "row", align: "center", gap: 8 }}>
        <Icon size={15} sx={{ color: "pink600" }} icon={<LiquidityIcon />} />
        <Text fs={[16, 16]} color="pink600">
          {t("liquidity.xyk.asset.positions.title")}
        </Text>
      </div>
      <SContainer>
        <div sx={{ flex: "column", gap: 24 }} css={{ flex: 1 }}>
          <div sx={{ flex: "row", gap: 7, align: "center" }}>
            <MultipleIcons
              icons={assetsMeta.map((asset: TAsset) => ({
                icon: <AssetLogo id={asset.id} />,
              }))}
            />

            <Text fs={[14, 18]} color={["white", "basic100"]}>
              {t("liquidity.xyk.asset.position.title", {
                symbol: assetsMeta
                  .map((assetMeta) => assetMeta.symbol)
                  .join("/"),
              })}
            </Text>
          </div>
          <div css={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div sx={{ flex: "column", gap: 6 }}>
              <Text fs={14} color="whiteish500">
                {t("liquidity.xyk.asset.position.availableShares")}
              </Text>
              <div>
                <Text>
                  {t("value.token", {
                    value: pool.shareTokenUserPosition?.balance,
                    fixedPointScale: pool.shareTokenMeta.decimals,
                  })}
                </Text>
              </div>
            </div>
            <Separator orientation="vertical" />

            {myBalance && (
              <div sx={{ flex: "column", gap: 6 }}>
                <div sx={{ display: "flex", gap: 6 }}>
                  <Text fs={14} color="whiteish500">
                    {t("liquidity.asset.positions.position.currentValue")}
                  </Text>
                </div>
                <div sx={{ flex: "column", align: "start" }}>
                  <Text
                    fs={[14, 16]}
                    lh={[16, 18]}
                    fw={500}
                    color="white"
                    tAlign="left"
                  >
                    {t("value.tokenWithSymbol", {
                      value: myBalance.myBalanceA,
                      symbol: assetMetaA.symbol,
                    })}{" "}
                    |{" "}
                    {t("value.tokenWithSymbol", {
                      value: myBalance.myBalanceB,
                      symbol: assetMetaB.symbol,
                    })}
                  </Text>
                  <DollarAssetValue
                    value={myBalance.totalDisplay}
                    wrapper={(children) => (
                      <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                        {children}
                      </Text>
                    )}
                  >
                    <DisplayValue value={myBalance.totalDisplay} />
                  </DollarAssetValue>
                </div>
              </div>
            )}
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
          <LiquidityPositionRemoveLiquidity
            pool={pool}
            onSuccess={() => null}
          />
        </div>
      </SContainer>
    </SPositions>
  )
}
