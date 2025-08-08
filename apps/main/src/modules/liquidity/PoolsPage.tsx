import { Plus } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DataTable,
  Flex,
  Icon,
  Paper,
  SectionHeader,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Link, useRouter, useSearch } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { PoolsFilters } from "@/modules/liquidity/components/PoolsFilters"
import { PoolsHeader } from "@/modules/liquidity/components/PoolsHeader"
import { useOmnipoolStablepoolAssets, useXYKPools } from "@/states/liquidity"

import { useIsolatedPoolsColumns } from "./IsolatedPools.columns"
import { usePoolColumns } from "./Liquidity.columns"

export const PoolsPage = () => {
  const [search, setSearch] = useState("")

  const { type, myLiquidity } = useSearch({
    from: "/liquidity/",
  })

  return (
    <>
      <PoolsHeader />
      <PoolsFilters onChange={setSearch} />

      {(type === "omnipoolStablepool" || type === "all") && (
        <OmnipoolAndStablepoolTable
          search={search}
          withPositions={myLiquidity}
        />
      )}
      {(type === "isolated" || type === "all") && (
        <IsolatedPoolsTable search={search} withPositions={myLiquidity} />
      )}
    </>
  )
}

export const OmnipoolAndStablepoolTable = ({
  search,
  withPositions,
}: {
  search: string
  withPositions?: boolean
}) => {
  const { t } = useTranslation("liquidity")
  const { data, isLoading } = useOmnipoolStablepoolAssets()
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
          columnPinning={{
            left: ["meta_name"],
          }}
          onRowClick={(asset) => {
            router.navigate({
              resetScroll: true,
              to: "/liquidity/$id",
              params: { id: asset.id },
            })
          }}
        />
      </TableContainer>
    </>
  )
}

export const IsolatedPoolsTable = ({
  search,
  withPositions,
}: {
  search: string
  withPositions?: boolean
}) => {
  const { t } = useTranslation("liquidity")
  const { data, isLoading } = useXYKPools()
  const columns = useIsolatedPoolsColumns()
  const { isMobile } = useBreakpoints()

  const router = useRouter()

  const filteredData = useMemo(() => {
    return (
      (withPositions ? data?.filter((asset) => asset.isPositions) : data) ?? []
    )
  }, [data, withPositions])

  return (
    <>
      <Flex justify="space-between" align="center" gap={20}>
        <SectionHeader>{t("section.isolatedPools")}</SectionHeader>
        <Button asChild>
          <Link to="/liquidity/create">
            <Icon component={Plus} size={14} />
            {t(
              isMobile
                ? "section.isolatedPools.btn.short"
                : "section.isolatedPools.btn",
            )}
          </Link>
        </Button>
      </Flex>
      <TableContainer as={Paper}>
        <DataTable
          data={filteredData}
          globalFilter={search}
          columns={columns}
          isLoading={isLoading}
          paginated
          pageSize={10}
          initialSorting={[{ id: "tvlDisplay", desc: true }]}
          onRowClick={(asset) =>
            router.navigate({
              resetScroll: true,
              to: "/liquidity/$id",
              params: { id: asset.id },
            })
          }
        />
      </TableContainer>
    </>
  )
}
