import { SContainer } from "./XcmPage.styled"

import type { TxInfo } from "@galacticcouncil/apps"

import { z } from "zod"
import { MakeGenerics, useLocation, useSearch } from "@tanstack/react-location"
import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent, EventName } from "@lit-labs/react"

import {
  isHydrationIncompatibleAccount,
  useAccount,
} from "sections/web3-connect/Web3Connect.utils"
import { useStore } from "state/store"
import {
  PROVIDERS_BY_WALLET_MODE,
  useWeb3ConnectStore,
  WalletMode,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import {
  DEFAULT_DEST_CHAIN,
  getAddressBookMode,
  getDefaultSrcChain,
  getDesiredWalletMode,
  getNotificationToastTemplates,
  getSubmittableExtrinsic,
  getCall,
} from "sections/xcm/XcmPage.utils"
import { genesisHashToChain } from "utils/helpers"
import { Asset } from "@galacticcouncil/sdk"
import { useRpcProvider } from "providers/rpcProvider"
import { ExternalAssetUpdateModal } from "sections/trade/modal/ExternalAssetUpdateModal"
import { useTranslation } from "react-i18next"
import { useMount } from "react-use"
import { AddressBook } from "components/AddressBook/AddressBook"
import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferState } from "@galacticcouncil/apps/build/types/app/xcm/types"
import { AnyChain } from "@galacticcouncil/xcm-core"

type WalletChangeDetail = {
  srcChain: string
}

export const XcmApp = createComponent({
  tagName: "gc-xcm",
  elementClass: Apps.XcmApp,
  react: React,
  events: {
    onXcmNew: "gc:xcm:new" as EventName<CustomEvent<TxInfo>>,
    onWalletChange: "gc:wallet:change" as EventName<
      CustomEvent<WalletChangeDetail>
    >,
    onCheckAssetDataClick: "gc:external:checkData" as EventName<
      CustomEvent<Asset>
    >,
    onAddressBookClick: "gc:address-book:open" as EventName<
      CustomEvent<TransferState>
    >,
  },
})

const stableCoinAssetId = import.meta.env.VITE_STABLECOIN_ASSET_ID

const XcmAppSearch = z.object({
  srcChain: z.string().optional(),
  destChain: z.string().optional(),
  asset: z.string().optional(),
})

type SearchGenerics = MakeGenerics<{
  Search: z.infer<typeof XcmAppSearch>
}>

export function XcmPage() {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()
  const { account } = useAccount()
  const { createTransaction } = useStore()
  const location = useLocation()
  const { disconnectIncompatible } = useWeb3ConnectStore()
  const [tokenCheck, setTokenCheck] = React.useState<Asset | null>(null)
  const [openAddressBook, setOpenAddressBook] = React.useState(false)
  const [destAddress, setDestAddress] = React.useState<string>("")

  const [incomingSrcChain, setIncomingSrcChain] = React.useState("")
  const [srcChain, setSrcChain] = React.useState(
    getDefaultSrcChain(account?.provider),
  )

  const rawSearch = useSearch<SearchGenerics>()
  const search = XcmAppSearch.safeParse(rawSearch)

  const srcChainDefault =
    search.success && search.data.srcChain ? search.data.srcChain : srcChain

  const destChainDefault =
    search.success && search.data.destChain
      ? search.data.destChain
      : DEFAULT_DEST_CHAIN

  const [dstChain, setDstChain] = React.useState<AnyChain | undefined>(
    undefined,
  )

  const { toggle: toggleWeb3Modal } = useWeb3ConnectStore()

  const handleSubmit = async (e: CustomEvent<TxInfo>) => {
    await createTransaction(
      {
        tx: await getSubmittableExtrinsic(e.detail),
        ...getCall(e.detail),
      },
      {
        onSuccess: () => {},
        onSubmitted: () => {},
        toast: getNotificationToastTemplates(e.detail),
      },
    )
  }

  React.useEffect(() => {
    return useWeb3ConnectStore.subscribe((state, prevState) => {
      const hasAccountChanged =
        state.account && state.account.address !== prevState.account?.address

      if (hasAccountChanged) {
        setSrcChain(
          incomingSrcChain || getDefaultSrcChain(state.account?.provider),
        )
      }
    })
  }, [incomingSrcChain])

  const handleWalletChange = (e: CustomEvent<WalletChangeDetail>) => {
    const { srcChain } = e.detail

    const walletMode = getDesiredWalletMode(srcChain)

    setIncomingSrcChain(srcChain)

    toggleWeb3Modal(walletMode, {
      chain: srcChain,
    })
  }

  const assetDefault =
    search.success && search.data.asset
      ? search.data.asset
      : srcChain === "ethereum"
        ? "eth"
        : undefined

  const ss58Prefix = genesisHashToChain(account?.genesisHash).prefix

  const blacklist = import.meta.env.VITE_ENV === "production" ? "" : ""

  useMount(() => {
    const srcChain = search?.data?.srcChain
    const walletMode = srcChain ? getDesiredWalletMode(srcChain) : null

    if (
      account &&
      walletMode &&
      !PROVIDERS_BY_WALLET_MODE[walletMode].includes(account.provider)
    ) {
      // Prompt user to switch wallet if the chain in query param is incompatible with the current wallet
      toggleWeb3Modal(walletMode, {
        chain: srcChain,
      })
    }
  })

  React.useEffect(() => {
    if (isHydrationIncompatibleAccount(account)) {
      const prevPath = location.current.pathname
      const unsubscribe = location.history.listen(({ location }) => {
        if (prevPath !== location.pathname) {
          disconnectIncompatible()
          toggleWeb3Modal(WalletMode.Default, {
            description: t("walletConnect.provider.description.invalidWallet"),
          })
        }
      })

      return () => {
        unsubscribe()
      }
    }
  }, [account, disconnectIncompatible, location, t, toggleWeb3Modal])

  const onModalClose = () => setOpenAddressBook(false)

  return (
    <SContainer>
      <XcmApp
        ref={(r) => {
          if (r) {
            r.setAttribute("assetCheckEnabled", "")
            r.setAttribute("addressBookEnabled", "")
          }
        }}
        destAddress={destAddress}
        srcChain={srcChainDefault}
        destChain={destChainDefault}
        asset={assetDefault}
        accountName={account?.name}
        accountProvider={account?.provider}
        accountAddress={account?.address}
        stableCoinAssetId={stableCoinAssetId}
        onXcmNew={handleSubmit}
        onWalletChange={handleWalletChange}
        ss58Prefix={ss58Prefix}
        blacklist={blacklist}
        onCheckAssetDataClick={(e) => setTokenCheck(e.detail)}
        onAddressBookClick={(e) => {
          if (e.detail.address === null && destAddress) {
            setDestAddress("")
          }

          setOpenAddressBook(true)
          setDstChain(e.detail.destChain)
        }}
      />
      {isLoaded && tokenCheck && (
        <ExternalAssetUpdateModal
          assetId={tokenCheck.id}
          open={!!tokenCheck}
          onClose={() => setTokenCheck(null)}
        />
      )}
      {openAddressBook && (
        <Modal open>
          <ModalContents
            onClose={onModalClose}
            contents={[
              {
                title: "Select destination address",
                content: (
                  <AddressBook
                    onSelect={(address) => {
                      setDestAddress(address)
                      onModalClose()
                    }}
                    mode={getAddressBookMode(dstChain)}
                  />
                ),
              },
            ]}
          />
        </Modal>
      )}
    </SContainer>
  )
}
