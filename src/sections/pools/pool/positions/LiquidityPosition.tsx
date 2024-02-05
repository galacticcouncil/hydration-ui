import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import MinusIcon from "assets/icons/MinusIcon.svg?react"
import { Trans, useTranslation } from "react-i18next"
import {
  SButton,
  SContainer,
} from "sections/pools/pool/positions/LiquidityPosition.styled"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { useState } from "react"
import { RemoveLiquidity } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidity"
import { Button } from "components/Button/Button"
import FPIcon from "assets/icons/PoolsAndFarms.svg?react"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { useFarms } from "api/farms"
import { useFarmDepositMutation } from "utils/farms/deposit"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage } from "state/store"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useDisplayPrice } from "utils/displayAsset"
import { BN_0 } from "utils/constants"
import Skeleton from "react-loading-skeleton"
import { LrnaPositionTooltip } from "sections/pools/components/LrnaPositionTooltip"
import { useRpcProvider } from "providers/rpcProvider"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { TPoolFullData, TXYKPool } from "sections/pools/PoolsPage.utils"
import { useMedia } from "react-use"
import { theme } from "theme"

type Props = {
  position: HydraPositionsTableData
  index: number
  pool: TPoolFullData
  onSuccess: () => void
}

function LiquidityPositionJoinFarmButton(props: {
  poolId: string
  position: HydraPositionsTableData
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccount()
  const [joinFarm, setJoinFarm] = useState(false)
  const farms = useFarms([props.poolId])
  const meta = assets.getAsset(props.poolId.toString())

  const toast = TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <Trans
        t={t}
        i18nKey={`farms.modal.join.toast.${msType}`}
        tOptions={{
          amount: props.position.shares,
          fixedPointScale: meta.decimals,
        }}
      >
        <span />
        <span className="highlight" />
      </Trans>
    )
    return memo
  }, {} as ToastMessage)

  const joinFarmMutation = useFarmDepositMutation(
    props.poolId,
    props.position.id,
    toast,
    () => setJoinFarm(false),
    props.onSuccess,
  )

  return (
    <>
      <Button
        variant="primary"
        size="small"
        disabled={!farms.data?.length || account?.isExternalWalletConnected}
        sx={{ width: "100%" }}
        onClick={() => setJoinFarm(true)}
      >
        <Icon size={16} icon={<FPIcon />} />
        {t("liquidity.asset.actions.joinFarms")}
      </Button>

      {joinFarm && farms.data && (
        <JoinFarmModal
          farms={farms.data}
          isOpen={joinFarm}
          poolId={props.poolId}
          shares={props.position.shares}
          onClose={() => setJoinFarm(false)}
          mutation={joinFarmMutation}
        />
      )}
    </>
  )
}

export function LiquidityPositionRemoveLiquidity(
  props:
    | {
        pool: TPoolFullData
        position: HydraPositionsTableData
        onSuccess: () => void
      }
    | {
        pool: TXYKPool
        position?: never
        onSuccess: () => void
      },
) {
  const { t } = useTranslation()
  const { account } = useAccount()
  const [openRemove, setOpenRemove] = useState(false)
  return (
    <>
      <SButton
        variant="secondary"
        size="small"
        fullWidth
        onClick={() => setOpenRemove(true)}
        disabled={
          account?.isExternalWalletConnected || !props.pool.canRemoveLiquidity
        }
      >
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<MinusIcon />} sx={{ mr: 8 }} />
          {t("liquidity.asset.actions.removeLiquidity")}
        </div>
      </SButton>
      {openRemove && (
        <RemoveLiquidity
          pool={props.pool}
          isOpen={openRemove}
          onClose={() => setOpenRemove(false)}
          position={props.position}
          onSuccess={props.onSuccess}
        />
      )}
    </>
  )
}

export const LiquidityPosition = ({
  position,
  index,
  onSuccess,
  pool,
}: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const meta = assets.getAsset(position.assetId)
  const price = useDisplayPrice(meta.id)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const shiftBy = meta.decimals
  const spotPrice = price.data?.spotPrice
  const providedAmountPrice = spotPrice
    ? position.providedAmount.multipliedBy(spotPrice).shiftedBy(-shiftBy)
    : BN_0

  const providedAmountPriceLoading = price.isLoading

  return (
    <SContainer>
      <div sx={{ flex: "column", gap: 24 }} css={{ flex: 1 }}>
        <div sx={{ flex: "row", gap: 7, align: "center" }}>
          {assets.isStableSwap(meta) ? (
            <MultipleIcons
              icons={meta.assets.map((asset: string) => ({
                icon: <AssetLogo id={asset} />,
              }))}
            />
          ) : (
            <Icon size={18} icon={<AssetLogo id={position.assetId} />} />
          )}
          <Text fs={[14, 18]} color={["white", "basic100"]}>
            {t("liquidity.asset.positions.position.title", { index })}
          </Text>
        </div>
        <div
          sx={{
            flex: ["column", "row"],
            justify: "space-between",
            gap: [10, 0],
          }}
        >
          <div
            sx={{ flex: ["row", "column"], gap: 6, justify: "space-between" }}
          >
            <Text fs={[13, 14]} color="whiteish500">
              {t("liquidity.asset.positions.position.initialValue")}
            </Text>
            <div sx={{ flex: "column", align: ["end", "start"] }}>
              <Text fs={[13, 16]}>
                {t("value.token", {
                  value: position.providedAmount,
                  fixedPointScale: meta.decimals,
                  numberSuffix: ` ${meta.symbol}`,
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
          <Separator orientation={isDesktop ? "vertical" : "horizontal"} />
          <div
            sx={{
              flex: ["row", "column"],
              gap: 6,
              justify: "space-between",
            }}
          >
            <div sx={{ display: "flex", gap: 6 }}>
              <Text fs={[13, 14]} color="whiteish500">
                {t("liquidity.asset.positions.position.currentValue")}
              </Text>
              <LrnaPositionTooltip
                assetId={position.assetId}
                tokenPosition={position.value}
                lrnaPosition={position.lrna}
              />
            </div>
            <div sx={{ flex: "column", align: ["end", "start"] }}>
              <WalletAssetsHydraPositionsData
                assetId={position.assetId}
                value={position.value}
                lrna={position.lrna}
                fontSize={[13, 16]}
              />
              <DollarAssetValue
                value={position.valueDisplay}
                wrapper={(children) => (
                  <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                    {children}
                  </Text>
                )}
              >
                <DisplayValue value={position.valueDisplay} />
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
        {!meta.isStableSwap && (
          <LiquidityPositionJoinFarmButton
            poolId={pool.id}
            position={position}
            onSuccess={onSuccess}
          />
        )}
        <LiquidityPositionRemoveLiquidity
          position={position}
          onSuccess={onSuccess}
          pool={pool}
        />
      </div>
    </SContainer>
  )
}
