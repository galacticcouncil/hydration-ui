import { FC, PropsWithChildren } from "react"
import { Header } from "components/Layout/Header/Header"
import {
  SPageContent,
  SPageInner,
  SPage,
} from "components/Layout/Page/Page.styled"
import { MobileNavBar } from "../Header/MobileNavBar/MobileNavBar"
import { ProviderSelectButton } from "sections/provider/ProviderSelectModal"

export const Page: FC<PropsWithChildren> = ({ children }) => (
  <SPage>
    <Header />
    <SPageContent>
      <SPageInner>{children}</SPageInner>
      <ProviderSelectButton />
    </SPageContent>
    <MobileNavBar />
  </SPage>
)
