import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer, SOmnipoolButton } from "./StablepoolPosition.styled"
import { BN_0, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import DropletIcon from "assets/icons/DropletIcon.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import {
  RemoveLiquidityButton,
  STABLEPOOLTYPE,
} from "sections/pools/stablepool/removeLiquidity/RemoveLiquidityButton"
import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import { useState } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import BN from "bignumber.js"
import { useRefetchAccountAssets } from "api/deposits"
import { SPoolDetailsContainer } from "sections/pools/pool/details/PoolDetails.styled"
import { usePoolData } from "sections/pools/pool/Pool"
import { AddLiquidity } from "sections/pools/modals/AddLiquidity/AddLiquidity"
import { useAssets } from "providers/assets"

export const StablepoolPosition = ({ amount }: { amount: BN }) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const pool = usePoolData().pool as TStablepool
  const refetchAccountAssets = useRefetchAccountAssets()
  const { getAssetWithFallback } = useAssets()

  const { isGETH, isInOmnipool, poolId } = pool
  const meta = getAssetWithFallback(poolId)

  const [transferOpen, setTransferOpen] = useState(false)

  const amountPrice = pool.spotPrice
    ? amount.shiftedBy(-meta.decimals).multipliedBy(pool.spotPrice)
    : BN_0

  return (
    <>
      {amount.isZero() ? null : (
        <SPoolDetailsContainer
          sx={{ height: ["auto", "auto"], p: [12, 20] }}
          css={{ background: "transparent" }}
        >
          <div
            sx={{
              flex: "row",
              align: "center",
              gap: 8,
              mb: [5, 0],
              mt: [5, 0],
            }}
          >
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
            <SContainer sx={{ height: ["auto", "auto"] }}>
              <div sx={{ flex: "column", gap: 24 }} css={{ flex: 1 }}>
                <div sx={{ flex: "row", gap: 7, align: "center" }}>
                  <MultipleAssetLogo iconId={meta.iconId} size={26} />
                  <Text>{meta.symbol}</Text>
                </div>
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
                      justify: "space-between",
                    }}
                  >
                    <Text fs={[13, 14]} color="whiteish500">
                      {t("liquidity.stablepool.position.amount")}
                    </Text>
                    <div sx={{ flex: "column", align: ["end", "start"] }}>
                      <Text fs={[13, 16]}>
                        {t("value.token", {
                          value: amount,
                          fixedPointScale: STABLEPOOL_TOKEN_DECIMALS,
                          numberSuffix: ` ${t(
                            "liquidity.stablepool.position.token",
                          )}`,
                        })}
                      </Text>
                      <DollarAssetValue
                        value={amountPrice}
                        wrapper={(children) => (
                          <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                            {children}
                          </Text>
                        )}
                      >
                        <DisplayValue value={amountPrice} />
                      </DollarAssetValue>
                    </div>
                  </div>

                  <Separator
                    orientation={isDesktop ? "vertical" : "horizontal"}
                  />

                  <div
                    sx={{
                      flex: ["row", "column"],
                      gap: 6,
                      justify: "space-between",
                    }}
                  >
                    <Text fs={[13, 14]} color="whiteish500">
                      {t("liquidity.asset.positions.position.currentValue")}
                    </Text>

                    <div sx={{ flex: "column", align: ["end", "start"] }}>
                      <Text fs={[13, 16]}>
                        {t("value.token", {
                          value: amount,
                          fixedPointScale: STABLEPOOL_TOKEN_DECIMALS,
                        })}
                      </Text>
                      <DollarAssetValue
                        value={amountPrice}
                        wrapper={(children) => (
                          <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                            {children}
                          </Text>
                        )}
                      >
                        <DisplayValue value={amountPrice} />
                      </DollarAssetValue>
                    </div>
                  </div>
                </div>
              </div>
              <div
                sx={{
                  flex: ["column", "row"],
                  gap: 12,
                }}
              >
                {isInOmnipool && !isGETH && (
                  <SOmnipoolButton
                    size="small"
                    fullWidth
                    onClick={() => setTransferOpen(true)}
                    disabled={!pool.canAddLiquidity}
                  >
                    <div
                      sx={{ flex: "row", align: "center", justify: "center" }}
                    >
                      <Icon icon={<PlusIcon />} sx={{ mr: 8 }} />
                      {t("liquidity.stablepool.addToOmnipool")}
                    </div>
                  </SOmnipoolButton>
                )}
                <RemoveLiquidityButton
                  onSuccess={refetchAccountAssets}
                  pool={pool}
                  type={STABLEPOOLTYPE.CLASSIC}
                />
              </div>
            </SContainer>
          </div>
        </SPoolDetailsContainer>
      )}

      <AddLiquidity
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
    </>
  )
}
