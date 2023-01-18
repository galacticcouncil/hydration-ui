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
import { RemoveLiquidity } from "../../modals/RemoveLiquidity/RemoveLiquidity"
import { useAssetMeta } from "../../../../api/assetMeta"

type Props = {
  position: HydraPositionsTableData
  onSuccess: () => void
  index: number
}

export const LiquidityPosition = ({ position, index, onSuccess }: Props) => {
  const { t } = useTranslation()
  const [openRemove, setOpenRemove] = useState(false)

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
          <div sx={{ flex: "column", gap: 2, align: "end" }}>
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
      <div sx={{ flex: "row", justify: "end" }}>
        <SButton
          variant="primary"
          size="small"
          onClick={() => {
            setOpenRemove(true)
          }}
        >
          <div sx={{ flex: "row", align: "center", justify: "center" }}>
            <Icon icon={<MinusIcon />} sx={{ mr: 8 }} />
            {t("liquidity.asset.actions.removeLiquidity")}
          </div>
        </SButton>
      </div>
      {openRemove && (
        <RemoveLiquidity
          isOpen={openRemove}
          onClose={() => setOpenRemove(false)}
          position={position}
          onSuccess={onSuccess}
        />
      )}
    </SContainer>
  )
}
