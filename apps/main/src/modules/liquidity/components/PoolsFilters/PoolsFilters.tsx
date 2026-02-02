import { Flex } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useState } from "react"

import { PoolTypeTabs } from "@/modules/liquidity/components/PoolsTypeTabs"
import { SearchInput } from "@/modules/liquidity/components/SearchInput"

type PoolsFiltersProps = {
  search: string
  onChange: (value: string) => void
}

export const PoolsFilters = ({ search, onChange }: PoolsFiltersProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const { isMobile } = useBreakpoints()

  const isHiddenTabs = isMobile && isFocused

  return (
    <Flex
      justify={isHiddenTabs ? "flex-end" : "space-between"}
      align="center"
      gap="xl"
      pt="s"
    >
      {!isHiddenTabs && <PoolTypeTabs />}
      <SearchInput
        search={search}
        isFocused={isFocused}
        onChange={onChange}
        onFocus={setIsFocused}
      />
    </Flex>
  )
}
