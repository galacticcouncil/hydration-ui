import { Page } from "components/Layout/Page/Page"
import { SContainer } from "./XcmPage.styled"

import type { TxInfo } from "@galacticcouncil/apps"

import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent, EventName } from "@lit-labs/react"

import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useStore } from "state/store"
import { isEvmAccount } from "utils/evm"
import {
  useWeb3ConnectStore,
  WalletMode,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { XCall, SubstrateApis } from "@galacticcouncil/xcm-sdk"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { isXCall } from "sections/transaction/ReviewTransactionXCallForm.utils"

export const XcmApp = createComponent({
  tagName: "gc-xcm-app",
  elementClass: Apps.XcmApp,
  react: React,
  events: {
    onXcmNew: "gc:xcm:new" as EventName<CustomEvent<TxInfo>>,
    onWalletChange: "gc:wallet:change" as EventName<CustomEvent<void>>,
  },
})

export function XcmPage() {
  const { account } = useAccount()
  const { createTransaction } = useStore()

  const { toggle } = useWeb3ConnectStore()

  const ref = React.useRef<Apps.XcmApp>(null)

  const handleSubmit = async (e: CustomEvent<TxInfo>) => {
    const { transaction, notification, meta } = e.detail

    const { srcChain } = meta ?? {}
    const chain = chainsMap.get(srcChain)

    const apiPool = SubstrateApis.getInstance()
    const api = chain ? await apiPool.api(chain.ws) : null
    if (!api) return

    let tx: SubmittableExtrinsic | undefined

    const xcall = transaction.get<XCall>()
    const xcallValid = isXCall(xcall)

    try {
      const extrinsicCall = api.createType("Call", xcall.data)
      const hex = extrinsicCall.toHex()
      tx = api.tx(hex)
    } catch {}

    await createTransaction(
      {
        tx,
        xcall: xcallValid ? xcall : undefined,
        xcallMeta: xcallValid ? meta : undefined,
      },
      {
        onSuccess: () => {},
        onSubmitted: () => {},
        toast: {
          onLoading: (
            <span
              dangerouslySetInnerHTML={{
                __html: notification.processing.rawHtml,
              }}
            />
          ),
          onSuccess: (
            <span
              dangerouslySetInnerHTML={{
                __html: notification.success.rawHtml,
              }}
            />
          ),
          onError: (
            <span
              dangerouslySetInnerHTML={{
                __html: notification.failure.rawHtml,
              }}
            />
          ),
        },
      },
    )
  }

  const handleWalletChange = () => {
    if (!account) return

    const requiredWalletMode = isEvmAccount(account?.address)
      ? WalletMode.Substrate
      : WalletMode.EVM

    toggle(requiredWalletMode)
  }

  return (
    <Page>
      <SContainer>
        <XcmApp
          ref={ref}
          srcChain="polkadot"
          destChain="hydradx"
          accountName={account?.name}
          accountProvider={account?.provider}
          accountAddress={account?.address}
          onXcmNew={handleSubmit}
          onWalletChange={handleWalletChange}
        />
      </SContainer>
    </Page>
  )
}
