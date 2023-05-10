import { Header } from "components/Layout/Header/Header"
import { ReactNode } from "react"
import { MobileNavBar } from "../Header/MobileNavBar/MobileNavBar"
import { SPage, SPageContent, SPageGrid, SPageInner } from "./Page.styled"
import { useApiPromise } from "utils/api"
import { ProviderSelectButton } from "sections/provider/components/ProviderSelectButton/ProviderSelectButton"

type Props = { variant?: "stats" | "default"; children: ReactNode }

export const Page = ({ variant = "default", children }: Props) => {
  const api = useApiPromise()

  return (
    <SPage variant={variant}>
      {variant === "stats" && <SPageGrid />}
      <Header />
      <SPageContent>
        <SPageInner>{children}</SPageInner>
        {Object.keys(api).length ? <ProviderSelectButton /> : null}
      </SPageContent>
      <MobileNavBar />
    </SPage>
  )
}
