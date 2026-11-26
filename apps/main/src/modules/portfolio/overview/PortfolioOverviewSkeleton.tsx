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
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { HYDRATION_PARACHAIN_ID } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { useMyAssetsColumns } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"
import { useMyBondsColumns } from "@/modules/portfolio/overview/MyBonds/MyBondsTable.columns"
import { useMyLiquidityColumns } from "@/modules/portfolio/overview/MyLiquidity/MyLiquidityTable.columns"
import { PortfolioChainHeader } from "@/modules/portfolio/overview/PortfolioChainHeader"
import { portfolioOverviewTabs } from "@/modules/portfolio/overview/PortfolioOverview"
import { SPortfolioTableWrapper } from "@/modules/portfolio/overview/PortfolioOverview.styled"

export const PortfolioOverviewSkeleton = () => {
  const { themeProps } = useTheme()
  const { t } = useTranslation("wallet")
  const { category } = useSearch({ from: "/portfolio/" })
  const assetsColumns = useMyAssetsColumns(false)
  const liquidityColumns = useMyLiquidityColumns()
  const bondsColumns = useMyBondsColumns()
  const sections = [
    {
      category: "assets",
      content: (
        <DataTable isLoading data={[]} columns={assetsColumns} size="small" />
      ),
    },
    {
      category: "bonds",
      content: (
        <DataTable isLoading data={[]} columns={bondsColumns} size="small" />
      ),
    },
    {
      category: "liquidity",
      content: (
        <DataTable
          isLoading
          data={[]}
          columns={liquidityColumns}
          size="small"
        />
      ),
    },
  ] as const

  return (
    <Flex direction="column" gap="l">
      <Box height={pxToRem(40)}>
        <Text fs="h7">
          <Skeleton width={pxToRem(104)} height="1em" />
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
                      <Skeleton width={pxToRem(64)} height="1em" />
                    </Text>
                  }
                  isLoading
                />
              ))}
            </Stack>
          </ScrollArea>
        </Box>
        <Separator />
        <Flex gap="base" p="m" sx={{ overflow: "hidden" }}>
          {portfolioOverviewTabs.map((tab) => (
            <Skeleton
              key={tab}
              width={pxToRem(72)}
              height={pxToRem(28)}
              borderRadius={themeProps.radii.full}
            />
          ))}
        </Flex>
        <Separator />
        <SPortfolioTableWrapper>
          {sections
            .filter(
              (section) => category === "all" || category === section.category,
            )
            .map((section, index) => (
              <Box key={section.category}>
                {category === "all" && (
                  <>
                    {index > 0 && <Separator />}
                    <Box px="m" py="s">
                      <Text fs="p6" fw={600} color={getToken("text.high")}>
                        {t(`myAssets.tabs.${section.category}`)}
                      </Text>
                    </Box>
                    <Separator />
                  </>
                )}
                <TableContainer>{section.content}</TableContainer>
              </Box>
            ))}
        </SPortfolioTableWrapper>
      </Paper>
    </Flex>
  )
}
