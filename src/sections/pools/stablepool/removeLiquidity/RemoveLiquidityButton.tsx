import { useState } from "react"
import { RemoveLiquidityModal } from "./RemoveLiquidityModal"
import { useTranslation } from "react-i18next"
import { Icon } from "components/Icon/Icon"
import MinusIcon from "assets/icons/MinusIcon.svg?react"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import { Button } from "components/Button/Button"
import { RemoveDepositModal } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal"
import { Modal } from "components/Modal/Modal"
import { scaleHuman } from "utils/balance"
import { GDOT_ERC20_ASSET_ID } from "utils/constants"

type Props = {
  pool: TStablepool
  type: STABLEPOOLTYPE
  onSuccess: () => void
}

export enum STABLEPOOLTYPE {
  CLASSIC,
  GIGA,
}

export const RemoveLiquidityButton = ({ pool, type, onSuccess }: Props) => {
  const { t } = useTranslation()

  const [openRemove, setOpenRemove] = useState<STABLEPOOLTYPE | null>(null)

  const { balance, meta, isGDOT, id, biggestPercentage } = pool

  const balanceHuman = balance?.transferable
    ? scaleHuman(balance.transferable, meta.decimals).toString()
    : undefined

  return (
    <>
      <Button
        variant="error"
        size="small"
        fullWidth
        onClick={() => setOpenRemove(type)}
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
      {STABLEPOOLTYPE.GIGA === openRemove && (
        <Modal open onClose={() => setOpenRemove(null)}>
          <RemoveDepositModal
            assetId={isGDOT ? GDOT_ERC20_ASSET_ID : id}
            balance={balanceHuman ?? "0"}
            assetReceiveId={isGDOT ? undefined : biggestPercentage?.assetId}
            onClose={() => setOpenRemove(null)}
          />
        </Modal>
      )}
    </>
  )
}
