import { useMatches, useRouter } from "@tanstack/react-router"

import { Loader } from "@/components/Loader"
import { BreadcrumbBar } from "@/modules/layout/components/BreadcrumbBar"
import { Container, MainContent } from "@/modules/layout/components/Content"
import { Footer } from "@/modules/layout/components/Footer"
import { Header } from "@/modules/layout/components/Header"
import { SubNavBar } from "@/modules/layout/components/SubNavBar"

export const LayoutSkeleton = () => {
  const router = useRouter()
  const matches = useMatches()
  const leafMatch = matches.at(-1)
  const navBar = matches.findLast((m) => m.staticData.pendingNavBar)?.staticData
    .pendingNavBar

  const PendingComponent = leafMatch
    ? router.routesById[leafMatch.routeId]?.options?.pendingComponent
    : null

  return (
    <>
      <Header />
      {navBar !== "subnav" && <BreadcrumbBar />}
      {navBar !== "breadcrumb" && <SubNavBar />}
      {PendingComponent ? (
        <Container>
          <MainContent>
            <PendingComponent />
          </MainContent>
        </Container>
      ) : (
        <Loader />
      )}
      <Footer loading />
    </>
  )
}
