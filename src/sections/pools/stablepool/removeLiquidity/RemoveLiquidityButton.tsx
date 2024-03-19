import { useState } from "react"
import { RemoveLiquidityModal } from "./RemoveLiquidityModal"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Icon } from "components/Icon/Icon"
import MinusIcon from "assets/icons/MinusIcon.svg?react"
import { TPoolFullData } from "sections/pools/PoolsPage.utils"
import { Button } from "components/Button/Button"

type Props = {
  pool: TPoolFullData
  onSuccess: () => void
}

export const RemoveLiquidityButton = ({ pool, onSuccess }: Props) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const [openRemove, setOpenRemove] = useState(false)

  return (
    <>
      <Button
        variant="error"
        size="small"
        fullWidth
        onClick={() => setOpenRemove(true)}
        disabled={account?.isExternalWalletConnected}
      >
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<MinusIcon />} sx={{ mr: 8 }} />
          {t("liquidity.asset.actions.removeLiquidity")}
        </div>
      </Button>
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
