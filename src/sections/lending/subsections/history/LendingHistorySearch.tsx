import { FC, useState } from "react"
import { useDebounce } from "react-use"

import { useTranslation } from "react-i18next"
import { Search } from "components/Search/Search"

type Props = {
  readonly onChange: (value: string) => void
}

export const LendingHistorySearch: FC<Props> = ({ onChange }) => {
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
    <Search
      value={input}
      onChange={setInput}
      placeholder={t("lending.history.search.placeholder")}
    />
  )
}
