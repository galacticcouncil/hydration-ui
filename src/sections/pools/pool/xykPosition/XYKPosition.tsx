import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import LiquidityIcon from "assets/icons/WaterRippleIcon.svg?react"
import { TXYKPool } from "sections/pools/PoolsPage.utils"
import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Separator } from "components/Separator/Separator"
import { useMemo, useState } from "react"
import { LiquidityPositionRemoveLiquidity } from "sections/pools/pool/positions/LiquidityPosition"
import { useMedia } from "react-use"
import { theme } from "theme"
import { JoinFarmsButton } from "sections/pools/farms/modals/join/JoinFarmsButton"
import { SPoolDetailsContainer } from "sections/pools/pool/details/PoolDetails.styled"
import { SPositionContainer } from "sections/pools/pool/myPositions/MyPositions.styled"
import { useAccountAssets, useRefetchAccountAssets } from "api/deposits"
import { RemoveLiquidity } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidity"
import { useXYKSDKPools } from "api/xyk"

export const XYKPosition = ({ pool }: { pool: TXYKPool }) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const refetchAccountAssets = useRefetchAccountAssets()
  const [openRemove, setOpenRemove] = useState(false)
  const { data: xykPools } = useXYKSDKPools()
  const [assetAReserve, assetBReserve] =
    xykPools?.find((xykPool) => xykPool.address === pool.poolAddress)?.tokens ??
    []

  const { data: accountAssets } = useAccountAssets()
  const shareTokensBalance = accountAssets?.accountAssetsMap.get(
    pool.id,
  )?.balance

  const assetsMeta = pool.meta.assets

  const [assetMetaA, assetMetaB] = assetsMeta

  const myBalance = useMemo(() => {
    if (
      pool.shareTokenIssuance?.myPoolShare &&
      pool.tvlDisplay &&
      assetAReserve &&
      assetBReserve
    ) {
      const myBalanceA = pool.shareTokenIssuance.myPoolShare
        .times(assetAReserve.balance)
        .div(100)
        .shiftedBy(-assetMetaA.decimals)

      const myBalanceB = pool.shareTokenIssuance.myPoolShare
        .times(assetBReserve.balance)
        .div(100)
        .shiftedBy(-assetMetaB.decimals)

      const totalDisplay = pool.tvlDisplay
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
    pool.tvlDisplay,
  ])

  if (!pool.shareTokenIssuance || !pool.shareTokenIssuance.myPoolShare)
    return null

  const onSuccess = () => {
    refetchAccountAssets()
  }

  return (
    <>
      <SPoolDetailsContainer
        sx={{ height: ["auto", "auto"] }}
        css={{ background: "transparent" }}
      >
        <div sx={{ flex: "row", align: "center", gap: 8 }}>
          <Icon size={15} sx={{ color: "pink600" }} icon={<LiquidityIcon />} />
          <Text fs={[16, 16]} color="pink600" font="GeistMonoSemiBold">
            {t("liquidity.xyk.asset.positions.title")}
          </Text>
        </div>
        <SPositionContainer>
          <div sx={{ flex: "column", gap: 16 }} css={{ flex: 1 }}>
            <div
              sx={{ flex: ["column", "row"], gap: 8, justify: "space-between" }}
            >
              <div sx={{ flex: "row", gap: 7, align: "center" }}>
                <MultipleAssetLogo iconId={pool.meta.iconId} size={28} />

                <Text fs={[14, 18]} color={["white", "basic100"]}>
                  {t("liquidity.xyk.asset.position.title", {
                    symbol: assetsMeta
                      .map((assetMeta) => assetMeta.symbol)
                      .join("/"),
                  })}
                </Text>
              </div>
              <div sx={{ flex: "row", gap: 8 }}>
                <JoinFarmsButton poolId={pool.id} onSuccess={onSuccess} />
                <LiquidityPositionRemoveLiquidity
                  pool={pool}
                  onRemovePosition={() => setOpenRemove(true)}
                />
              </div>
            </div>

            <Separator color="white" opacity={0.06} />

            <div
              sx={{
                flex: ["column", "row"],
                justify: "space-between",
                gap: [10, 0],
              }}
            >
              <div
                sx={{
                  flex: ["row", "column"],
                  gap: 6,
                  justify: ["space-between", "initial"],
                }}
              >
                <Text fs={[13, 14]} color="whiteish500">
                  {t("liquidity.xyk.asset.position.availableShares")}
                </Text>
                <div>
                  <Text fs={[13, 16]}>
                    {t("value.token", {
                      value: shareTokensBalance?.balance,
                      fixedPointScale: pool.meta.decimals,
                    })}
                  </Text>
                </div>
              </div>

              <Separator
                orientation={isDesktop ? "vertical" : "horizontal"}
                color="white"
                opacity={0.06}
              />

              {myBalance && (
                <div
                  sx={{
                    flex: ["row", "column"],
                    gap: 6,
                    justify: "space-between",
                  }}
                >
                  <div sx={{ flex: ["row", "column"], gap: 6 }}>
                    <Text fs={[13, 14]} color="whiteish500">
                      {t("liquidity.asset.positions.position.currentValue")}
                    </Text>
                  </div>
                  <div sx={{ flex: "column", align: ["end", "start"] }}>
                    <Text
                      fs={[13, 16]}
                      lh={[13, 18]}
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
        </SPositionContainer>
      </SPoolDetailsContainer>
      {openRemove && (
        <RemoveLiquidity
          pool={pool}
          isOpen
          onClose={() => setOpenRemove(false)}
          onSuccess={onSuccess}
        />
      )}
    </>
  )
}
