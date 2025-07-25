import { useRefetchAccountAssets } from "api/deposits"
import { SPoolDetailsContainer } from "sections/pools/pool/details/PoolDetails.styled"
import { usePoolData } from "sections/pools/pool/Pool"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import { SContainer, SOmnipoolButton } from "./StablepoolPosition.styled"
import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAssetsPrice } from "state/displayPrice"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Separator } from "components/Separator/Separator"
import {
  RemoveLiquidityButton,
  STABLEPOOLTYPE,
} from "sections/pools/stablepool/removeLiquidity/RemoveLiquidityButton"
import { Icon } from "components/Icon/Icon"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { useState } from "react"
import { AddLiquidity } from "sections/pools/modals/AddLiquidity/AddLiquidity"
import IconPercentageSquare from "assets/icons/IconPercentageSquare.svg?react"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"

export const ATokenPosition = () => {
  const { t } = useTranslation()
  const pool = usePoolData().pool as TStablepool
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const refetchAccountAssets = useRefetchAccountAssets()

  const [transferOpen, setTransferOpen] = useState(false)

  const { meta: meta_, isInOmnipool, relatedAToken, aBalance } = pool

  const meta = relatedAToken ?? meta_

  const { getAssetPrice } = useAssetsPrice(
    relatedAToken ? [relatedAToken.id] : [],
  )

  if (!relatedAToken || !aBalance) return null

  const price = getAssetPrice(relatedAToken.id).price

  const balance = aBalance.transferable ?? "0"
  const scaledBalance = BN(balance).shiftedBy(-relatedAToken.decimals)
  const balanceDisplay = price ? scaledBalance.multipliedBy(price) : BN_0

  return (
    <>
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
            icon={<IconPercentageSquare />}
          />
          <Text fs={[16, 16]} color="vibrantBlue200">
            {t("liquidity.stablepool.atoken.positions.title")}
          </Text>
          <InfoTooltip
            text={t("liquidity.stablepool.atoken.positions.description")}
          />
        </div>
        <div sx={{ flex: "column", gap: 16 }}>
          <SContainer sx={{ height: ["auto", "auto"] }}>
            <div sx={{ flex: "column", gap: 24 }} css={{ flex: 1 }}>
              <div sx={{ flex: "row", gap: 7, align: "center" }}>
                <MultipleAssetLogo iconId={meta.iconId} size={26} />
                {relatedAToken && <Text>{meta.symbol}</Text>}
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
                        value: scaledBalance,
                      })}
                    </Text>
                    <DollarAssetValue
                      value={balanceDisplay}
                      wrapper={(children) => (
                        <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                          {children}
                        </Text>
                      )}
                    >
                      <DisplayValue value={balanceDisplay} />
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
                        value: scaledBalance,
                      })}
                    </Text>
                    <DollarAssetValue
                      value={balanceDisplay}
                      wrapper={(children) => (
                        <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                          {children}
                        </Text>
                      )}
                    >
                      <DisplayValue value={balanceDisplay} />
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
              {isInOmnipool && (
                <SOmnipoolButton
                  size="small"
                  fullWidth
                  onClick={() => setTransferOpen(true)}
                  disabled={!pool.canAddLiquidity}
                >
                  <div sx={{ flex: "row", align: "center", justify: "center" }}>
                    <Icon icon={<PlusIcon />} sx={{ mr: 8 }} />
                    {t("liquidity.stablepool.addToOmnipool")}
                  </div>
                </SOmnipoolButton>
              )}
              <RemoveLiquidityButton
                onSuccess={refetchAccountAssets}
                pool={pool}
                type={STABLEPOOLTYPE.GIGA}
              />
            </div>
          </SContainer>
        </div>
      </SPoolDetailsContainer>

      <AddLiquidity
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
    </>
  )
}
