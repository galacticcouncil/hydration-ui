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

  const { balance, aBalance, meta, relatedAToken } = pool

  const maxBalanceHuman =
    type === STABLEPOOLTYPE.GIGA && relatedAToken
      ? scaleHuman(aBalance?.transferable ?? 0, relatedAToken.decimals)
      : scaleHuman(balance?.transferable ?? 0, meta.decimals)

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
      {STABLEPOOLTYPE.GIGA === openRemove && relatedAToken && (
        <Modal open onClose={() => setOpenRemove(null)}>
          <RemoveDepositModal
            assetId={relatedAToken.id}
            maxBalance={maxBalanceHuman.toString()}
            onClose={() => setOpenRemove(null)}
          />
        </Modal>
      )}
    </>
  )
}
