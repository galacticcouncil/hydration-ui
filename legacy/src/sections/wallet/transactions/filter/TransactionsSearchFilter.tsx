import { useState } from "react"
import { useDebounce } from "react-use"
import IconSearch from "assets/icons/IconSearch.svg?react"
import { useTranslation } from "react-i18next"

import { Input } from "components/Input/Input"
import { SSearchContainer } from "sections/wallet/assets/filter/WalletAssetsFilters.styled"
import { useWalletTransactionsFilters } from "sections/wallet/transactions/WalletTransactions.utils"

export const TransactionsSearchFilter = () => {
  const { t } = useTranslation()

  const { search, setFilter } = useWalletTransactionsFilters()

  const [searchVal, setSearchVal] = useState(search ?? "")

  useDebounce(
    () => {
      setFilter({ search: searchVal.length > 0 ? searchVal : undefined })
    },
    300,
    [searchVal],
  )
  return (
    <SSearchContainer>
      <IconSearch />
      <Input
        value={searchVal}
        onChange={(val) => {
          setSearchVal(val?.startsWith?.("0x") ? val.slice(2) : val)
        }}
        name="search"
        label="Input"
        placeholder={t("wallet.transactions.filter.search.placeholder")}
      />
    </SSearchContainer>
  )
}
