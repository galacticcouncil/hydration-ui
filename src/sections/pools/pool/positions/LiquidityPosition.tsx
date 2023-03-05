import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as MinusIcon } from "assets/icons/MinusIcon.svg"
import { useTranslation } from "react-i18next"
import {
  SButton,
  SContainer,
} from "sections/pools/pool/positions/LiquidityPosition.styled"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { useState } from "react"
import { RemoveLiquidity } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidity"
import { useAssetMeta } from "api/assetMeta"
import { Button } from "components/Button/Button"
import { ReactComponent as FPIcon } from "assets/icons/PoolsAndFarms.svg"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useFarms } from "api/farms"
import { useFarmDepositMutation } from "utils/farms/deposit"

type Props = {
  pool: OmnipoolPool
  position: HydraPositionsTableData
  onSuccess: () => void
  index: number
}

function LiquidityPositionJoinFarmButton(props: {
  pool: OmnipoolPool
  position: HydraPositionsTableData
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const [joinFarm, setJoinFarm] = useState(false)
  const farms = useFarms(props.pool.id)

  const joinFarmMutation = useFarmDepositMutation(
    props.pool.id,
    props.position.id,
  )

  return (
    <>
      <Button
        variant="primary"
        size="small"
        disabled={!farms.data?.length}
        sx={{ width: ["100%", 220] }}
        onClick={() => setJoinFarm(true)}
      >
        <Icon size={16} icon={<FPIcon />} />
        {t("liquidity.asset.actions.joinFarms")}
      </Button>

      {joinFarm && (
        <JoinFarmModal
          isOpen={joinFarm}
          poolId={props.pool.id}
          shares={props.position.shares}
          onClose={() => setJoinFarm(false)}
          mutation={joinFarmMutation}
        />
      )}
    </>
  )
}

function LiquidityPositionRemoveLiquidity(props: {
  position: HydraPositionsTableData
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const [openRemove, setOpenRemove] = useState(false)
  return (
    <>
      <SButton
        variant="primary"
        size="small"
        onClick={() => setOpenRemove(true)}
      >
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<MinusIcon />} sx={{ mr: 8 }} />
          {t("liquidity.asset.actions.removeLiquidity")}
        </div>
      </SButton>
      {openRemove && (
        <RemoveLiquidity
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
  pool,
  position,
  index,
  onSuccess,
}: Props) => {
  const { t } = useTranslation()
  const meta = useAssetMeta(position.assetId)

  return (
    <SContainer>
      <div sx={{ flex: "column", gap: 24 }} css={{ flex: 1 }}>
        <div sx={{ flex: "row", gap: 7, align: "center", ml: [0, "-25px"] }}>
          <Icon
            icon={getAssetLogo(position.symbol)}
            sx={{ width: 18, height: "fit-content" }}
          />
          <Text fs={[14, 18]} color={["white", "basic100"]}>
            {t("liquidity.asset.positions.position.title", { index })}
          </Text>
        </div>
        <div css={{ display: "grid", gridTemplateColumns: "1fr auto 1fr" }}>
          <div sx={{ flex: "column", gap: 6 }}>
            <Text fs={[14, 14]} color="whiteish500">
              {t("liquidity.asset.positions.position.amount")}
            </Text>
            <Text fs={[16, 16]}>
              {t("liquidity.asset.positions.position.shares", {
                shares: position.shares,
                fixedPointScale: meta.data?.decimals ?? 12,
              })}
            </Text>
          </div>
          <Separator orientation="vertical" />
          <div sx={{ flex: "column", gap: 6, align: "end" }}>
            <Text fs={[14, 14]} color="whiteish500">
              {t("liquidity.asset.positions.position.currentValue")}
            </Text>
            <div sx={{ flex: "column", align: "end" }}>
              <WalletAssetsHydraPositionsData
                symbol={position.symbol}
                value={position.value}
                lrna={position.lrna}
              />
              <DollarAssetValue
                value={position.valueUSD}
                wrapper={(children) => (
                  <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                    {children}
                  </Text>
                )}
              >
                {t("value.usd", { amount: position.valueUSD })}
              </DollarAssetValue>
            </div>
          </div>
        </div>
      </div>
      <div
        sx={{
          flex: "column",
          align: "center",
          gap: 8,
        }}
      >
        {import.meta.env.VITE_FF_FARMS_ENABLED === "true" && (
          <LiquidityPositionJoinFarmButton
            pool={pool}
            position={position}
            onSuccess={onSuccess}
          />
        )}
        <LiquidityPositionRemoveLiquidity
          position={position}
          onSuccess={onSuccess}
        />
      </div>
    </SContainer>
  )
}
