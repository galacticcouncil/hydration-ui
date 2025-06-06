import { Search } from "@galacticcouncil/ui/assets/icons"
import { Input } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDebounce } from "react-use"

type Props = {
  readonly onChange: (value: string) => void
}

export const BorrowHistorySearch: FC<Props> = ({ onChange }) => {
  const { t } = useTranslation(["borrow"])

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
    <Input
      iconStart={Search}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder={t("borrow:history.search.placeholder")}
      sx={{ minWidth: ["100%", 250] }}
    />
  )
}
