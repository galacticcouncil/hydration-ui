import { Breadcrumb } from "@/components/Breadcrumb"
import { Content, ContentContainer } from "@/modules/layout/components/Content"
import { useCrumbs } from "@/modules/layout/hooks/useCrumbs"

export const BreadcrumbBar = () => {
  const hasCrumbs = useCrumbs().length > 1

  if (!hasCrumbs) return null

  return (
    <ContentContainer>
      <Content>
        <Breadcrumb />
      </Content>
    </ContentContainer>
  )
}
