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
      <div
        css={{
          height: 474,
          background:
            "radial-gradient(73.65% 123% at 57% -38.76%, rgba(93, 177, 255, 0.59) 0%, rgba(0, 194, 255, 0) 100%), linear-gradient(180deg, #00579F 0%, #023B6A 25%, #060917 100%);",
        }}
      >
        {variant === "stats" && <SPageGrid />}
        <Header />
        <SPageContent>
          <SPageInner>{children}</SPageInner>
          {Object.keys(api).length ? <ProviderSelectButton /> : null}
        </SPageContent>
        <MobileNavBar />
      </div>
    </SPage>
  )
}
