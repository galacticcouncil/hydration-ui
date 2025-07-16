import { Search } from "@galacticcouncil/ui/assets/icons"
import { Input } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

type SearchInputProps = {
  onChange: (value: string) => void
  isFocused: boolean
  onFocus: (value: boolean) => void
}

export const SearchInput = ({
  onChange,
  isFocused,
  onFocus,
}: SearchInputProps) => {
  const { t } = useTranslation("common")

  return (
    <Input
      onFocus={() => onFocus(true)}
      onBlur={() => onFocus(false)}
      placeholder={t("search.placeholder.any")}
      iconStart={Search}
      onChange={(e) => onChange(e.target.value)}
      customSize="medium"
      sx={{
        width: [isFocused ? "100%" : 100, 270],
      }}
    />
  )
}
