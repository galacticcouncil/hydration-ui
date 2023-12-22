import { Page } from "components/Layout/Page/Page"
import { SContainer } from "./XcmPage.styled"

import { PageSwitch } from "sections/xcm/components/PageSwitch"
import { BridgeList } from "sections/xcm/components/bridge/BridgeList"

export function BridgePage() {
  return (
    <Page>
      <PageSwitch />
      <SContainer>
        <BridgeList />
      </SContainer>
    </Page>
  )
}
