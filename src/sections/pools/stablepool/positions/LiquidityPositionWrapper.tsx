import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"
import { ReactComponent as DropletIcon } from "assets/icons/DropletIcon.svg"
import { Icon } from "components/Icon/Icon"
import { SPositions } from "../../pool/Pool.styled"
import BN from "bignumber.js"
import { u32, u8 } from "@polkadot/types"

type Props = {
  amount: BN
  assets: {
    id: string
    symbol: string
    decimals: u8 | u32
  }[]
}

export const LiquidityPositionWrapper = ({ amount, assets }: Props) => {
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
        <LiquidityPosition amount={amount} assets={assets} />
      </div>
    </SPositions>
  )
}
