import { Page } from "components/Layout/Page/Page"
import { SContainer } from "./XcmPage.styled"

import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent } from "@lit-labs/react"

import { GcTransactionCenter } from "sections/xcm/TransactionCenter"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const XcmApp = createComponent({
  tagName: "gc-xcm-app",
  elementClass: Apps.XcmApp,
  react: React,
})

export function XcmPage() {
  const { account } = useAccount()

  const ref = React.useRef<Apps.XcmApp>(null)
  return (
    <GcTransactionCenter>
      <Page>
        <SContainer>
          <XcmApp
            ref={ref}
            srcChain="polkadot"
            srcEvmChain="moonbeam"
            destChain="hydradx"
            accountName={account?.name}
            accountProvider={account?.provider}
            accountAddress={account?.address}
          />
        </SContainer>
      </Page>
    </GcTransactionCenter>
  )
}
