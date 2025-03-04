import { FC, useState } from "react"
import { useDebounce } from "react-use"
import IconSearch from "assets/icons/IconSearch.svg?react"

import { Input } from "components/Input/Input"
import { SSearchContainer } from "sections/wallet/assets/filter/WalletAssetsFilters.styled"
import { useTranslation } from "react-i18next"

type Props = {
  readonly onChange: (value: string) => void
}

export const LendingTransactionsSearch: FC<Props> = ({ onChange }) => {
  const { t } = useTranslation()

  const [input, setInput] = useState("")
  useDebounce(
    () => {
      if (!input) {
        onChange("")
      }

      input.length >= 3 && onChange(input.trim().toLowerCase())
    },
    350,
    [input],
  )

  return (
    <SSearchContainer>
      <IconSearch />
      <Input
        value={input}
        onChange={setInput}
        name="search"
        label="Input"
        placeholder={t("lending.transactions.search.placeholder")}
      />
    </SSearchContainer>
  )
}
