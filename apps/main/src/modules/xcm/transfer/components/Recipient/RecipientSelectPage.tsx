import { Box, ScrollArea } from "@galacticcouncil/ui/components"
import {
  formatDestChainAddress,
  isAddressValidOnChain,
} from "@galacticcouncil/utils"
import {
  Account,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { useFormContext } from "react-hook-form"
import { I18nextProvider, useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import i18n from "@/i18n"
import { RecipientCustomAddressForm } from "@/modules/xcm/transfer/components/Recipient/RecipientCustomAddressForm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"
import { useRpcProvider } from "@/providers/rpcProvider"

type RecipientSelectPageProps = {
  onBack: () => void
  onSelectAddress: (address: string, account?: Account) => void
}

const ignoreAddressChange = () => undefined

/** A controlled recipient picker in the transfer's existing modal and form. */
export const RecipientSelectPage = ({
  onBack,
  onSelectAddress,
}: RecipientSelectPageProps) => {
  const { t } = useTranslation("xcm")
  const { papi } = useRpcProvider()
  const { watch } = useFormContext<XcmFormValues>()
  const [destChain, destAccount] = watch(["destChain", "destAccount"])
  const isValidAddress = (address: string) =>
    !!destChain && isAddressValidOnChain(address, destChain)

  return (
    <Web3ConnectPage
      neckwork={neckworkClient}
      papi={papi}
      mode={destChain ? getWalletModeByChain(destChain) : WalletMode.Default}
      meta={{
        title: t("recipient.modal.title"),
        initialProvider: destAccount?.provider,
        closable: true,
        hideExternalWallet: true,
        hideMultisig: true,
      }}
      accountFilter={(account) => isValidAddress(account.rawAddress)}
      onBack={onBack}
      onAccountSelect={(account) => {
        if (destChain && isValidAddress(account.rawAddress))
          onSelectAddress(
            formatDestChainAddress(account.rawAddress, destChain),
            account,
          )
      }}
      customSource={
        destChain
          ? {
              title: t("recipient.input.customWallet"),
              content: (
                <I18nextProvider i18n={i18n}>
                  <ScrollArea height="100%">
                    <Box px="base">
                      <RecipientCustomAddressForm
                        chainName={destChain.name}
                        isValidAddress={isValidAddress}
                        onChange={ignoreAddressChange}
                        onSubmit={(address) => {
                          if (isValidAddress(address.trim()))
                            onSelectAddress(address.trim())
                        }}
                      />
                    </Box>
                  </ScrollArea>
                </I18nextProvider>
              ),
            }
          : undefined
      }
    />
  )
}
