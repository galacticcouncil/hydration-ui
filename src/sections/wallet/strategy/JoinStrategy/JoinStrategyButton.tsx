import { useState } from "react"
import { THollarPoolWithAccountBalance } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { JoinStrategyModal } from "./JoinStrategyModal"

export const JoinStrategyButton = ({
  pools,
}: {
  pools: THollarPoolWithAccountBalance[]
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        fullWidth
        variant="primary"
        sx={{ mt: 12 }}
        onClick={() => setOpen(true)}
      >
        {t("wallet.strategy.hollar.balance.btn")}
      </Button>

      {open && (
        <JoinStrategyModal pools={pools} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
