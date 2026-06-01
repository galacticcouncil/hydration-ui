import { Flex, Stack } from "@galacticcouncil/ui/components"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { OtcFilters } from "@/modules/trade/otc/filter/OtcFilters"
import { OtcSearch } from "@/modules/trade/otc/filter/OtcSearch"
import { OtcHeader } from "@/modules/trade/otc/header/OtcHeader"
import { OtcTable } from "@/modules/trade/otc/table/OtcTable"
import { otcColumnSortPriority } from "@/modules/trade/otc/table/OtcTable.columns"

export const TradeOtcPage = () => {
  const paginationProps = useDataTableUrlPagination("/trade/otc", "page", 10)

  const sortingProps = useDataTableUrlSorting("/trade/otc", "sort", {
    columnPriority: otcColumnSortPriority,
    onChange: () => paginationProps.onPageClick(1),
  })

  const [searchPhrase, setSearchPhrase] = useDataTableUrlSearch(
    "/trade/otc",
    "search",
    { onChange: () => paginationProps.onPageClick(1) },
  )

  return (
    <>
      <OtcHeader />
      <Stack gap="xl">
        <Flex justify="space-between" align="center">
          <OtcFilters />
          <OtcSearch
            searchPhrase={searchPhrase}
            onSearchPhraseChange={setSearchPhrase}
          />
        </Flex>
        <OtcTable
          searchPhrase={searchPhrase}
          paginationProps={paginationProps}
          sortingProps={sortingProps}
        />
      </Stack>
    </>
  )
}
