import { Flex } from "@galacticcouncil/ui/components"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { OtcFilters } from "@/modules/trade/otc/filter/OtcFilters"
import { OtcSearch } from "@/modules/trade/otc/filter/OtcSearch"
import { OtcHeader } from "@/modules/trade/otc/header/OtcHeader"
import { PlaceOrder } from "@/modules/trade/otc/place-order/PlaceOrder"
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
      <Flex direction="column" gap="xl">
        <OtcSearch
          searchPhrase={searchPhrase}
          onSearchPhraseChange={setSearchPhrase}
        />
        <Flex justify="space-between" align="center">
          <OtcFilters />
          <PlaceOrder />
        </Flex>
        <OtcTable
          searchPhrase={searchPhrase}
          paginationProps={paginationProps}
          sortingProps={sortingProps}
        />
      </Flex>
    </>
  )
}
