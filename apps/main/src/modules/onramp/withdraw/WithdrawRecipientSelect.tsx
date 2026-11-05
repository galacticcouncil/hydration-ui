import { Box, ScrollArea } from "@galacticcouncil/ui/components"
import {
  useAccount,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { FC, useEffect, useState } from "react"
import { I18nextProvider, useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import i18n from "@/i18n"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { WithdrawRouteSelect } from "@/modules/onramp/withdraw/components/WithdrawRouteSelect"
import { useWithdrawDestinationOptions } from "@/modules/onramp/withdraw/hooks/useWithdrawDestinationOptions"
import { RecipientCustomAddressForm } from "@/modules/xcm/transfer/components/Recipient/RecipientCustomAddressForm"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"
import { useRpcProvider } from "@/providers/rpcProvider"

import type {
  WithdrawAssetSelection,
  WithdrawRecipient,
} from "./WithdrawAssetSelect.utils"
import { getWithdrawRecipientRoutes } from "./WithdrawRecipient.utils"

type WithdrawRecipientSelectProps = {
  startInSplit?: boolean
  initialRecipient?: WithdrawRecipient
  sourceAssetKey: string
  onBack: () => void
  onSelect: (selection: WithdrawAssetSelection) => void
}

const ignoreAddressChange = () => undefined

export const WithdrawRecipientSelect: FC<WithdrawRecipientSelectProps> = ({
  sourceAssetKey,
  startInSplit = false,
  initialRecipient,
  onBack,
  onSelect,
}) => {
  const { t } = useTranslation(["onramp", "xcm"])
  const { papi } = useRpcProvider()
  const { account: source } = useAccount()
  const allOptions = useWithdrawDestinationOptions()
  const options = allOptions.filter(
    (option) => option.sourceAssetKey === sourceAssetKey,
  )
  const [recipient, setRecipient] = useState<WithdrawRecipient | null>(
    initialRecipient ?? null,
  )
  const setWalletContentWidth = useOnrampModal(
    (state) => state.setWalletContentWidth,
  )
  useEffect(() => () => setWalletContentWidth(null), [setWalletContentWidth])
  const compatibleRoutes = (recipient: WithdrawRecipient) =>
    getWithdrawRecipientRoutes(options, recipient, source?.rawAddress ?? "")
  const selectRecipient = (recipient: WithdrawRecipient) => {
    const routes = compatibleRoutes(recipient)
    if (!routes.length) return
    setRecipient(recipient)
  }
  const substrateEvmModes = new Set([
    WalletMode.Substrate,
    WalletMode.EVM,
    WalletMode.SubstrateEVM,
    WalletMode.SubstrateH160,
  ])
  const mode = options.every(({ destinationChain }) =>
    substrateEvmModes.has(getWalletModeByChain(destinationChain)),
  )
    ? WalletMode.SubstrateEVM
    : WalletMode.Default

  return (
    <Web3ConnectPage
      layout="split"
      keepSplitOpen={startInSplit}
      accountPanel={
        recipient
          ? {
              onBack: () => setRecipient(null),
              content: (
                <I18nextProvider i18n={i18n}>
                  <WithdrawRouteSelect
                    embedded
                    sourceAssetKey={sourceAssetKey}
                    recipient={recipient}
                    onBack={() => setRecipient(null)}
                    onSelect={(option) => onSelect({ ...option, recipient })}
                  />
                </I18nextProvider>
              ),
            }
          : undefined
      }
      walletFirst={!startInSplit}
      walletListWidth={520}
      neckwork={neckworkClient}
      papi={papi}
      mode={mode}
      onContentWidthChange={setWalletContentWidth}
      meta={{
        title: t("xcm:recipient.modal.title"),
        groupAccountsByWallet: true,
        initialProvider: initialRecipient?.account?.provider,
        closable: true,
        hideExternalWallet: true,
        hideMultisig: true,
      }}
      accountFilter={(account) =>
        compatibleRoutes({ address: account.rawAddress, account }).length > 0
      }
      onBack={recipient ? () => setRecipient(null) : onBack}
      onAccountSelect={(account) =>
        selectRecipient({ address: account.rawAddress, account })
      }
      customSource={{
        title: t("xcm:recipient.input.customWallet"),
        content: (
          <I18nextProvider i18n={i18n}>
            <ScrollArea height="100%">
              <Box px="base">
                <RecipientCustomAddressForm
                  chainName={t("withdraw.recipient.supportedNetwork")}
                  isValidAddress={(address) =>
                    compatibleRoutes({ address }).length > 0
                  }
                  onChange={ignoreAddressChange}
                  onSubmit={(address) =>
                    selectRecipient({ address: address.trim() })
                  }
                />
              </Box>
            </ScrollArea>
          </I18nextProvider>
        ),
      }}
    />
  )
}
