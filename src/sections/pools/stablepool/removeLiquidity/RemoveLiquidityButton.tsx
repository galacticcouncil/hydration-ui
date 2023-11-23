import { useState } from "react"
import { RemoveLiquidityModal } from "./RemoveLiquidityModal"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { SButton } from "sections/pools/pool/positions/LiquidityPosition.styled"
import { Icon } from "components/Icon/Icon"
import MinusIcon from "assets/icons/MinusIcon.svg?react"
import { TOmnipoolAsset } from "sections/pools/PoolsPage.utils"

type Props = {
  pool: TOmnipoolAsset
  onSuccess: () => void
}

export const RemoveLiquidityButton = ({ pool, onSuccess }: Props) => {
  const { t } = useTranslation()
  const { account } = useAccount()
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
          pool={pool}
          onSuccess={onSuccess}
          isOpen={openRemove}
          onClose={() => setOpenRemove(false)}
        />
      )}
    </>
  )
}
