import { useState } from "react"
import { SSearchContainer } from "./SearchFilter.styled"
import { Input } from "components/Input/Input"
import IconSearch from "assets/icons/IconSearch.svg?react"
import { useTranslation } from "react-i18next"
import { useSearch } from "@tanstack/react-location"
import { useDebounce } from "react-use"
import { useSearchFilter } from "./SearchFilter.utils"

export const SearchFilter = () => {
  const { t } = useTranslation()
  const { setSearchParam } = useSearchFilter()
  const { search } = useSearch<{
    Search: {
      search?: string
    }
  }>()
  const [searchVal, setSearchVal] = useState(search ?? "")

  useDebounce(() => setSearchParam(searchVal), 300, [searchVal])

  return (
    <div sx={{ flex: "column", gap: [16, 30], mb: [16, 20] }}>
      <SSearchContainer>
        <IconSearch />
        <Input
          value={searchVal}
          onChange={setSearchVal}
          name="search"
          label="Input"
          placeholder={t("liquidity.search.placeholder")}
        />
      </SSearchContainer>
    </div>
  )
}
