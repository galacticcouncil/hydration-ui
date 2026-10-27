import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDebounce } from "react-use"

import { TitleWithSearch } from "@/components/TitleWithSearch"

type Props = {
  readonly title: string
  readonly searchPhrase: string
  readonly onChange: (value: string) => void
}

export const BorrowHistorySearch: FC<Props> = ({
  title,
  searchPhrase,
  onChange,
}) => {
  const { t } = useTranslation("common")

  const [input, setInput] = useState(searchPhrase)
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
    <TitleWithSearch
      noTopPadding
      title={title}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder={t("search.placeholder.assets")}
    />
  )
}
