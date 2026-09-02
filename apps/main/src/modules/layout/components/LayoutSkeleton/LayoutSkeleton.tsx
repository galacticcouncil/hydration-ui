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

  const PendingComponent = leafMatch
    ? router.routesById[leafMatch.routeId]?.options?.pendingComponent
    : null

  return (
    <>
      <Header />
      <BreadcrumbBar />
      <SubNavBar />
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
