import { Header } from "components/Layout/Header/Header"
import { ReactNode } from "react"
import { ProviderSelectButton } from "sections/provider/ProviderSelectModal"
import { MobileNavBar } from "../Header/MobileNavBar/MobileNavBar"
import { SPage, SPageContent, SPageGrid, SPageInner } from "./Page.styled"

type Props = { variant?: "stats" | "default"; children: ReactNode }

export const Page = ({ variant = "default", children }: Props) => (
  <SPage variant={variant}>
    {variant === "stats" && <SPageGrid />}
    <Header />
    <SPageContent>
      <SPageInner>{children}</SPageInner>
      <ProviderSelectButton />
    </SPageContent>
    <MobileNavBar />
  </SPage>
)
