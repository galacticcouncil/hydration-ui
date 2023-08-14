import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer } from "./LiquidityPosition.styled"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { BN_1, BN_100, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import BN from "bignumber.js"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { u32, u8 } from "@polkadot/types"
import { useAccountStore } from "state/store"
import { ComponentProps, useState } from 'react'
import { SButton } from "../../pool/positions/LiquidityPosition.styled"
import { ReactComponent as MinusIcon } from "assets/icons/MinusIcon.svg"
import { RemoveLiquidityModal } from "../removeLiquidity/RemoveLiquidityModal"

type Props = {
  amount: BN
  poolId: u32
  withdrawFee: BN
  assets: {
    id: string
    symbol: string
    decimals: u8 | u32
  }[]
}

function LiquidityPositionRemoveLiquidity(props: {
  position: ComponentProps<typeof RemoveLiquidityModal>['position']
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const [openRemove, setOpenRemove] = useState(false)
  return (
    <>
      <SButton
        variant="secondary"
        size="small"
        onClick={() => setOpenRemove(true)}
        disabled={account?.isExternalWalletConnected}
      >
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<MinusIcon />} sx={{ mr: 8 }} />
          {t("liquidity.asset.actions.removeLiquidity")}
        </div>
      </SButton>
      {openRemove && (
        <RemoveLiquidityModal
          isOpen={openRemove}
          onClose={() => setOpenRemove(false)}
          position={props.position}
          onSuccess={props.onSuccess}
        />
      )}
    </>
  )
}

export const LiquidityPosition = ({ amount, assets, poolId, withdrawFee }: Props) => {
  const { t } = useTranslation()

  return (
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
                numberSuffix: ` ${t("liquidity.stablepool.position.token")}`,
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
            <div sx={{ flex: "column", align: "start" }}>
              <DollarAssetValue
                value={BN_100}
                wrapper={(children) => (
                  <Text fs={[11, 12]} lh={[14, 16]} color="whiteish500">
                    {children}
                  </Text>
                )}
              >
                <DisplayValue value={BN_100} />
              </DollarAssetValue>
            </div>
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
        <LiquidityPositionRemoveLiquidity
          position={{
            withdrawFee,
            poolId,
            amount,
            shares: BN_100,
            price: BN_1,
            providedAmount: BN_100,
          }}
          onSuccess={console.log}
        />
      </div>
    </SContainer>
  )
}
