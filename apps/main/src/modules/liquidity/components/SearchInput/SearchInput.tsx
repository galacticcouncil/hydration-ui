import { Search } from "@galacticcouncil/ui/assets/icons"
import { Input } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

type SearchInputProps = {
  onChange: (value: string) => void
  isFocused: boolean
  setIsFocused: (value: boolean) => void
}

export const SearchInput = ({
  onChange,
  isFocused,
  setIsFocused,
}: SearchInputProps) => {
  const { t } = useTranslation("common")

  return (
    <Input
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder={t("search.placeholder")}
      iconStart={Search}
      onChange={(e) => onChange(e.target.value)}
      customSize="medium"
      sx={{
        width: [isFocused ? "100%" : 100, 270],
      }}
    />
  )
}
