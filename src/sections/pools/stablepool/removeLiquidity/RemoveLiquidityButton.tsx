import { useState } from "react"
import { RemoveLiquidityModal } from "./RemoveLiquidityModal"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Icon } from "components/Icon/Icon"
import MinusIcon from "assets/icons/MinusIcon.svg?react"
import { TPoolFullData } from "sections/pools/PoolsPage.utils"
import { Button } from "components/Button/Button"
import { RemoveDepositModal } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal"
import { Modal } from "components/Modal/Modal"
import { scaleHuman } from "utils/balance"
import { GDOT_ERC20_ASSET_ID } from "utils/constants"
import { useAssets } from "providers/assets"

type Props = {
  pool: TPoolFullData
  onSuccess: () => void
}

enum STABLEPOOLTYPE {
  CLASSIC,
  GIGADOT,
}

export const RemoveLiquidityButton = ({ pool, onSuccess }: Props) => {
  const { t } = useTranslation()
  const { getErc20 } = useAssets()
  const { account } = useAccount()
  const [openRemove, setOpenRemove] = useState<STABLEPOOLTYPE | null>(null)

  const meta = getErc20(GDOT_ERC20_ASSET_ID)
  const balance = pool.balance?.freeBalance
    ? scaleHuman(pool.balance?.freeBalance, meta?.decimals ?? 0).toString()
    : undefined

  return (
    <>
      <Button
        variant="error"
        size="small"
        fullWidth
        onClick={() =>
          setOpenRemove(
            pool.isGigaDOT ? STABLEPOOLTYPE.GIGADOT : STABLEPOOLTYPE.CLASSIC,
          )
        }
        disabled={account?.isExternalWalletConnected}
      >
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<MinusIcon />} sx={{ mr: 8 }} />
          {t("liquidity.asset.actions.removeLiquidity")}
        </div>
      </Button>
      {STABLEPOOLTYPE.CLASSIC === openRemove && (
        <RemoveLiquidityModal
          isOpen
          pool={pool}
          onSuccess={onSuccess}
          onClose={() => setOpenRemove(null)}
        />
      )}
      {STABLEPOOLTYPE.GIGADOT === openRemove && (
        <Modal open onClose={() => setOpenRemove(null)}>
          <RemoveDepositModal
            assetId={GDOT_ERC20_ASSET_ID}
            balance={balance ?? "0"}
            onClose={() => setOpenRemove(null)}
          />
        </Modal>
      )}
    </>
  )
}
