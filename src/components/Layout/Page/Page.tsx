import { Header } from "components/Layout/Header/Header"
import { ReactNode } from "react"
import { MobileNavBar } from "../Header/MobileNavBar/MobileNavBar"
import { SPage, SPageContent, SPageGrid, SPageInner } from "./Page.styled"
import { ProviderSelectButton } from "sections/provider/components/ProviderSelectButton/ProviderSelectButton"

type Props = { variant?: "stats" | "default"; children: ReactNode }

export const Page = ({ variant = "default", children }: Props) => {
  return (
    <SPage variant={variant}>
      <div>
        {variant === "stats" && <SPageGrid />}
        <Header />
        <SPageContent>
          <SPageInner>{children}</SPageInner>
          <ProviderSelectButton />
        </SPageContent>
        <MobileNavBar />
      </div>
    </SPage>
  )
}
