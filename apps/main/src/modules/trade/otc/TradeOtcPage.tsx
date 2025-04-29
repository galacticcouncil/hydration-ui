import { Flex } from "@galacticcouncil/ui/components"
import { useState } from "react"

import { OtcFilters } from "@/modules/trade/otc/filter/OtcFilters"
import { OtcSearch } from "@/modules/trade/otc/filter/OtcSearch"
import { OtcHeader } from "@/modules/trade/otc/header/OtcHeader"
import { PlaceOrder } from "@/modules/trade/otc/place-order/PlaceOrder"
import { OtcTable } from "@/modules/trade/otc/table/OtcTable"

export const TradeOtcPage = () => {
  const [searchPhrase, setSearchPhrase] = useState("")

  return (
    <>
      <OtcHeader />
      <Flex direction="column" gap={20}>
        <OtcSearch
          searchPhrase={searchPhrase}
          onSearchPhraseChange={setSearchPhrase}
        />
        <Flex justify="space-between" align="center">
          <OtcFilters />
          <PlaceOrder />
        </Flex>
        <OtcTable searchPhrase={searchPhrase} />
      </Flex>
    </>
  )
}
