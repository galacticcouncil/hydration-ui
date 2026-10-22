import {
  Box,
  DataTable,
  Flex,
  Paper,
  ScrollArea,
  Separator,
  Skeleton,
  Stack,
  TableContainer,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { HYDRATION_PARACHAIN_ID } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"

import { useMyAssetsColumns } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"
import { useMyBondsColumns } from "@/modules/portfolio/overview/MyBonds/MyBondsTable.columns"
import { useMyLiquidityColumns } from "@/modules/portfolio/overview/MyLiquidity/MyLiquidityTable.columns"
import { PortfolioChainHeader } from "@/modules/portfolio/overview/PortfolioChainHeader"
import { portfolioOverviewTabs } from "@/modules/portfolio/overview/PortfolioOverview"
import { SPortfolioTableWrapper } from "@/modules/portfolio/overview/PortfolioOverview.styled"

export const PortfolioOverviewSkeleton = () => {
  const { category } = useSearch({ from: "/portfolio/" })
  const assetsColumns = useMyAssetsColumns(false)
  const liquidityColumns = useMyLiquidityColumns()
  const bondsColumns = useMyBondsColumns()

  return (
    <Flex direction="column" gap="l">
      <Box height="2.5rem">
        <Text fs="h7">
          <Skeleton width="6.5rem" height="1em" />
        </Text>
      </Box>

      <Paper sx={{ overflow: "hidden" }}>
        <PortfolioChainHeader
          isLoading
          name="Hydration"
          chainId={HYDRATION_PARACHAIN_ID}
          totalDisplay=""
          replaceLogoWhenLoading={false}
          disabled
        />
        <Box p="m">
          <ScrollArea orientation="horizontal" horizontalEdgeOffset="m">
            <Stack separated gap="xxl" direction="row">
              {Array.from({ length: 6 }, (_, index) => (
                <ValueStats
                  key={index}
                  sx={{ flex: 1 }}
                  wrap
                  size="small"
                  align="left"
                  customLabel={
                    <Text fs="p6">
                      <Skeleton width="4rem" height="1em" />
                    </Text>
                  }
                  isLoading
                />
              ))}
            </Stack>
          </ScrollArea>
        </Box>
        <Separator />
        <Flex gap="base" p="m">
          {portfolioOverviewTabs.map((tab) => (
            <Skeleton
              key={tab}
              width="4.5rem"
              height="1.75rem"
              borderRadius="9999px"
            />
          ))}
        </Flex>
        <Separator />
        <SPortfolioTableWrapper>
          <TableContainer>
            {category === "liquidity" ? (
              <DataTable
                isLoading
                data={[]}
                columns={liquidityColumns}
                size="small"
              />
            ) : category === "bonds" ? (
              <DataTable
                isLoading
                data={[]}
                columns={bondsColumns}
                size="small"
              />
            ) : (
              <DataTable
                isLoading
                data={[]}
                columns={assetsColumns}
                size="small"
              />
            )}
          </TableContainer>
        </SPortfolioTableWrapper>
      </Paper>
    </Flex>
  )
}
