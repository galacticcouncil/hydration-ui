import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  DataTable,
  Flex,
  Input,
  Paper,
  SectionHeader,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useRouter, useSearch } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { PoolType } from "@/routes/_liquidity/liquidity.pools"
import { useOmnipoolAssets, useXYKPools } from "@/states/liquidity"

import { PoolsHeader, PoolTypeTabs } from "./components"
import { useIsolatedPoolsColumns, usePoolColumns } from "./Liquidity.utils"
import { PoolDetails } from "./PoolDetails"

export const PoolsPage = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const [search, setSearch] = useState("")

  const { type, id } = useSearch({
    from: "/_liquidity/liquidity/pools",
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
        <OmnipoolAndStablepoolTable search={search} type={type} />
      )}
      {(type === "isolated" || type === "all") && (
        <IsolatedPoolsTable search={search} type={type} />
      )}
    </div>
  )
}

export const OmnipoolAndStablepoolTable = ({
  search,
  type,
  withPositions,
}: {
  search: string
  type: PoolType
  withPositions?: boolean
}) => {
  const { t } = useTranslation("liquidity")
  const { data, isLoading } = useOmnipoolAssets()
  const columns = usePoolColumns()

  const router = useRouter()

  const filteredData = useMemo(() => {
    return withPositions ? data?.filter((asset) => asset.isPositions) : data
  }, [data, withPositions])

  return (
    <>
      <SectionHeader>{t("section.omnipoolStablepool")}</SectionHeader>
      <TableContainer as={Paper}>
        <DataTable
          isLoading={isLoading}
          globalFilter={search}
          data={filteredData ?? []}
          columns={columns}
          initialSorting={[{ id: "id", desc: true }]}
          onRowClick={(asset) =>
            router.navigate({
              to: router.state.location.pathname,
              search: { type, id: asset.id },
              resetScroll: false,
            })
          }
        />
      </TableContainer>
    </>
  )
}

export const IsolatedPoolsTable = ({
  search,
  type,
  withPositions,
}: {
  search: string
  type: PoolType
  withPositions?: boolean
}) => {
  const { t } = useTranslation("liquidity")
  const { data, isLoading } = useXYKPools()
  const columns = useIsolatedPoolsColumns()

  const router = useRouter()

  const filteredData = useMemo(() => {
    return withPositions ? data?.filter((asset) => asset.isPositions) : data
  }, [data, withPositions])

  return (
    <>
      <SectionHeader>{t("section.isolatedPools")}</SectionHeader>
      <TableContainer as={Paper}>
        <DataTable
          data={filteredData ?? []}
          globalFilter={search}
          columns={columns}
          isLoading={isLoading}
          paginated
          pageSize={10}
          initialSorting={[{ id: "tvlDisplay", desc: true }]}
          onRowClick={(asset) =>
            router.navigate({
              to: router.state.location.pathname,
              search: { type, id: asset.id },
              resetScroll: false,
            })
          }
        />
      </TableContainer>
    </>
  )
}
