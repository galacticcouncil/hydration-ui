import { Page } from "components/Layout/Page/Page"
import { SubNavigation } from "./SubNavigation"
import { ReactNode } from "react"

export const TradePage = ({ children }: { children: ReactNode }) => (
  <Page
    subHeader={<SubNavigation />}
    subHeaderStyle={{
      background: "rgba(9, 9, 9, 0.09)",
      borderTop: "1px solid rgba(114, 131, 165, 0.6)",
    }}
  >
    {children}
  </Page>
)
