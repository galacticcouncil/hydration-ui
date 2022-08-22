import { FC, PropsWithChildren } from "react"
import { PageHeader } from "components/Page/Header/PageHeader"
import { PageContent, PageInner, SPage } from "./Page.styled"

export const Page: FC<PropsWithChildren> = ({ children }) => (
  <SPage>
    <PageHeader />
    <PageContent>
      <PageInner>{children}</PageInner>
    </PageContent>
  </SPage>
)
