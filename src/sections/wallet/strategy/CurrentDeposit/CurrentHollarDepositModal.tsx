import { Modal } from "components/Modal/Modal"
import { useState } from "react"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { RemoveDepositModal } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal"
import { useTranslation } from "react-i18next"

export const CurrentHollarDepositModal = ({
  userBalances,
  userBalancesIds,
  onClose,
}: {
  userBalances: THollarPool[]
  userBalancesIds: string[]
  onClose: () => void
}) => {
  const { t } = useTranslation()
  const [removeAsset, setRemoveAsset] = useState(userBalances[0]?.meta.id)

  const maxBalance =
    userBalances.find((pool) => pool.meta.id === removeAsset)
      ?.userShiftedBalance ?? "0"

  return (
    <Modal onClose={onClose} open>
      <RemoveDepositModal
        assetId={removeAsset}
        maxBalance={maxBalance}
        setRemoveAsset={setRemoveAsset}
        removeAssets={userBalancesIds}
        onClose={onClose}
        description={t("wallet.strategy.hollar.remove.description")}
      />
    </Modal>
  )
}
