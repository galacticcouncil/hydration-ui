import { useMatch, useMatches, useRouter } from "@tanstack/react-router"

import { Loader } from "@/components/Loader"
import { ProviderRpcSelect } from "@/components/ProviderRpcSelect/ProviderRpcSelect"
import { TabMenu } from "@/components/TabMenu"
import {
  Container,
  Content,
  ContentContainer,
  MainContent,
} from "@/modules/layout/components/Content"
import { Header } from "@/modules/layout/components/Header"
import { useRemoveInitialLoader } from "@/modules/layout/hooks/useRemoveInitialLoader"
import { useSubNav } from "@/modules/layout/hooks/useSubNav"

export const LayoutSkeleton = () => {
  useRemoveInitialLoader()

  const router = useRouter()
  const matches = useMatches()
  const leafMatch = matches.at(-1)

  const subNav = useSubNav()

  const isLiqDetailPage = useMatch({
    from: "/liquidity/$id",
    shouldThrow: false,
  })

  const hasSubNav = !isLiqDetailPage && subNav.length > 1

  const PendingComponent = leafMatch
    ? router.routesById[leafMatch.routeId]?.options?.pendingComponent
    : null

  return (
    <>
      <Header />
      {hasSubNav && (
        <ContentContainer>
          <Content>
            <TabMenu
              items={subNav}
              size="medium"
              variant="transparent"
              horizontalEdgeOffset="var(--layout-gutter)"
            />
          </Content>
        </ContentContainer>
      )}
      {PendingComponent ? (
        <Container>
          <MainContent>
            <PendingComponent />
          </MainContent>
        </Container>
      ) : (
        <Loader />
      )}
      <ProviderRpcSelect bottomPinned />
    </>
  )
}
