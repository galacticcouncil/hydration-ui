import { Box, Grid } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Outlet } from "@tanstack/react-router"
import { FC, ReactNode } from "react"

import { Breadcrumb, BreadcrumbItem } from "@/components/Breadcrumb"
import { Content, MainContent } from "@/modules/layout/components/Content"
import { SubpageMenu } from "@/modules/layout/components/SubpageMenu"

type Props = {
  readonly actions?: ReactNode
  readonly subpageMenu?: ReactNode
  readonly crumbs?: BreadcrumbItem[]
  readonly ignoreCurrentSearch?: boolean
  readonly subpageMenuHidden?: boolean
}

export const SubpageLayout: FC<Props> = ({
  actions,
  subpageMenu,
  crumbs = [],
  ignoreCurrentSearch,
  subpageMenuHidden = false,
}) => {
  return (
    <>
      {crumbs.length > 0 && (
        <Box
          py={8}
          sx={{
            borderBottomWidth: 1,
            borderBottomStyle: "solid",
            borderBottomColor: getToken("details.separators"),
          }}
        >
          <Content>
            <Breadcrumb crumbs={crumbs} />
          </Content>
        </Box>
      )}
      <MainContent>
        <Grid columnTemplate="1fr auto" align="center" mb={20}>
          {(!subpageMenuHidden && subpageMenu) ?? (
            <SubpageMenu ignoreCurrentSearch={ignoreCurrentSearch} />
          )}
          <Box sx={{ gridColumn: 2 }}>{actions}</Box>
        </Grid>
        <Outlet />
      </MainContent>
    </>
  )
}
