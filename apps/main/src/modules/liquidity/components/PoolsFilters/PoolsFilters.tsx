import { Box } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { TitleWithSearch } from "@/components/TitleWithSearch"
import { PoolTypeTabs } from "@/modules/liquidity/components/PoolsTypeTabs"

type PoolsFiltersProps = {
  search: string
  onChange: (value: string) => void
}

export const PoolsFilters = ({ search, onChange }: PoolsFiltersProps) => {
  const { t } = useTranslation("common")

  return (
    <Box pt="s">
      <TitleWithSearch
        filters={<PoolTypeTabs />}
        value={search}
        placeholder={t("search.placeholder.any")}
        onChange={(e) => onChange(e.target.value)}
        customSize="medium"
      />
    </Box>
  )
}
