import { useWalletTransactionsFilters } from "sections/wallet/transactions/WalletTransactions.utils"
import { SFilterButton } from "./TransactionsTypeFilter.styled"
import { useTranslation } from "react-i18next"

const FILTER_BUTTONS = [
  {
    type: "all",
  },
  {
    type: "deposit",
  },
  {
    type: "withdraw",
  },
] as const

export const TransactionsTypeFilter = () => {
  const { t } = useTranslation()
  const { type: activeType, setFilter } = useWalletTransactionsFilters()
  return (
    <div sx={{ flex: "row", gap: 32, px: 32 }}>
      {FILTER_BUTTONS.map(({ type }) => (
        <SFilterButton
          key={type}
          active={activeType === type}
          onClick={() => setFilter({ type })}
        >
          {t(`wallet.transactions.filter.${type}`)}
        </SFilterButton>
      ))}
    </div>
  )
}
