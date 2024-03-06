import { Input } from "components/Input/Input"
import IconSearch from "assets/icons/IconSearch.svg?react"
import { useTranslation } from "react-i18next"

export type DisplayAssetSearchProps = {
  value: string
  onChange: (value: string) => void
}

export const DisplayAssetSearch: React.FC<DisplayAssetSearchProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation()

  return (
    <Input
      label={t("header.settings.displayAsset.search.placeholder")}
      placeholder={t("header.settings.displayAsset.search.placeholder")}
      name="display-asset-search"
      onChange={onChange}
      value={value}
      iconStart={<IconSearch />}
    />
  )
}
