import { useNavigate, useSearch } from "@tanstack/react-location"
import { Search } from "components/Search/Search"
import { useState } from "react"
import { useDebounce } from "react-use"
import { MarketsHeaderValues } from "sections/lending/ui/header/MarketsHeaderValues"
import { MarketAssetsTable } from "sections/lending/ui/table/market-assets/MarketAssetsTable"

export const LendingMarketsPage = () => {
  const navigate = useNavigate()
  const query = useSearch<{
    Search: {
      search?: string
    }
  }>()

  const [search, setSearch] = useState(query.search ?? "")

  useDebounce(
    () => {
      if (search && search !== query.search) {
        navigate({
          search: {
            search: search,
          },
        })
      }
    },
    300,
    [search],
  )

  return (
    <>
      <MarketsHeaderValues sx={{ mb: [10, 40] }} />
      <Search
        name="market-search"
        placeholder="Search by token name, symbol or address"
        value={search}
        onChange={setSearch}
        sx={{ mb: [20, 30] }}
      />
      <MarketAssetsTable search={search} />
    </>
  )
}
