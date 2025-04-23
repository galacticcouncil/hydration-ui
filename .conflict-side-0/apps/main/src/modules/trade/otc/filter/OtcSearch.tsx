import { Search } from "@galacticcouncil/ui/assets/icons"
import { Input } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly searchPhrase: string
  readonly onSearchPhraseChange: (searchPhrase: string) => void
}

export const OtcSearch: FC<Props> = ({
  searchPhrase,
  onSearchPhraseChange,
}) => {
  const { t } = useTranslation("trade")

  return (
    <Input
      value={searchPhrase}
      onChange={(e) => onSearchPhraseChange(e.currentTarget.value)}
      customSize="large"
      placeholder={t("otc.filters.inputPlaceholder")}
      iconStart={Search}
    />
  )
}
