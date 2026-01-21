import { Flex } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getTokenPx } from "@galacticcouncil/ui/utils"
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
      gap={20}
      sx={{ pt: [10, 30], pb: getTokenPx("containers.paddings.secondary") }}
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
