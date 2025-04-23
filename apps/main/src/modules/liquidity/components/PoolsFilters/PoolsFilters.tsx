import { Flex } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useState } from "react"

import { PoolTypeTabs, SearchInput } from "@/modules/liquidity/components"

type PoolsFiltersProps = {
  onChange: (value: string) => void
}

export const PoolsFilters = ({ onChange }: PoolsFiltersProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const { isMobile } = useBreakpoints()

  const isHiddenTabs = isMobile && isFocused

  return (
    <Flex
      justify={isHiddenTabs ? "flex-end" : "space-between"}
      align="center"
      gap={20}
      sx={{ pt: 30, pb: getTokenPx("containers.paddings.secondary") }}
    >
      {!isHiddenTabs && <PoolTypeTabs />}
      <SearchInput
        onChange={onChange}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
      />
    </Flex>
  )
}
