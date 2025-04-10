import { Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Input } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { PoolsHeader, PoolTypeTabs } from "./components"
import { PoolDetails } from "./PoolDetails"
import { IsolatedPoolsTable, OmnipoolAndStablepoolTable } from "./PoolsPage"

export const MyLiquidityPage = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const [search, setSearch] = useState("")

  const { type, id } = useSearch({
    from: "/_liquidity/liquidity/my-liquidity",
  })

  if (id !== undefined) return <PoolDetails id={id.toString()} />

  return (
    <div>
      <PoolsHeader />
      <Flex
        justify="space-between"
        align="center"
        gap={20}
        sx={{ pt: 30, pb: getTokenPx("containers.paddings.secondary") }}
      >
        <PoolTypeTabs />
        <Input
          placeholder={t("common:search.placeholder")}
          iconStart={Search}
          onChange={(e) => setSearch(e.target.value)}
          customSize="medium"
          sx={{ width: 270 }}
        />
      </Flex>

      {(type === "omnipoolStablepool" || type === "all") && (
        <OmnipoolAndStablepoolTable search={search} type={type} withPositions />
      )}
      {(type === "isolated" || type === "all") && (
        <IsolatedPoolsTable search={search} type={type} withPositions />
      )}
    </div>
  )
}
