import {
  Flex,
  Modal,
  ModalHeader,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AddressBookModal } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AddressBookFormField } from "@/form/AddressBookFormField"
import { XcLogo } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/XcLogo"
import { XcChainAssetSelectFormField } from "@/modules/trade/swap/sections/XcSwap/components/XcChainAssetSelect"
import {
  XcChain,
  XcChainAssetPair,
  XcUserData,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/lib/useXcSwapForm"
import { XcSwapSwitcher } from "@/modules/trade/swap/sections/XcSwap/XcSwapSwitcher"

type Props = {
  readonly sourceChainAssetPairs: XcChainAssetPair[]
  readonly destChainAssetPairs: XcChainAssetPair[]
  readonly userData: XcUserData
}

const ChainLabel: React.FC<{ label: string; chain: XcChain | null }> = ({
  label,
  chain,
}) => (
  <Flex align="center" gap="s">
    <Text fs="p5" color={getToken("text.medium")}>
      {label}
    </Text>
    {chain && (
      <>
        <XcLogo src={chain.logo} size="extra-small" />
        <Text fs="p5" fw={600} color={getToken("text.high")}>
          {chain.name}
        </Text>
      </>
    )}
  </Flex>
)

export const XcSwapFields: React.FC<Props> = ({
  sourceChainAssetPairs,
  destChainAssetPairs,
  userData,
}) => {
  const { t } = useTranslation(["common"])
  const { watch, setValue } = useFormContext<XcSwapFormValues>()
  const [isContactsOpen, setIsContactsOpen] = useState(false)

  const [srcChain, destChain] = watch(["srcChain", "destChain"])

  return (
    <Stack>
      <XcChainAssetSelectFormField<XcSwapFormValues>
        chainFieldName="srcChain"
        assetFieldName="srcAsset"
        amountFieldName="srcAmount"
        label={<ChainLabel label={t("from")} chain={srcChain} />}
        chainAssetPairs={sourceChainAssetPairs}
        modalTitle="Source chain & asset"
        maxBalance={userData.sourceBalance}
        displayValue={`$${userData.sourceUsd}`}
        onAmountChange={(amount) =>
          setValue("destAmount", amount, { shouldValidate: true })
        }
      />

      <XcSwapSwitcher />

      <XcChainAssetSelectFormField<XcSwapFormValues>
        chainFieldName="destChain"
        assetFieldName="destAsset"
        amountFieldName="destAmount"
        label={<ChainLabel label={t("to")} chain={destChain} />}
        chainAssetPairs={destChainAssetPairs}
        modalTitle="Destination chain & asset"
        hideMaxBalanceAction
        maxBalance="0"
        disabledInput
      />

      <Separator mx="-xl" />

      <AddressBookFormField<XcSwapFormValues>
        fieldName="destAddress"
        onOpenMyContacts={() => setIsContactsOpen(true)}
      />

      <Modal
        variant="popup"
        open={isContactsOpen}
        onOpenChange={setIsContactsOpen}
      >
        <AddressBookModal
          header={
            <ModalHeader
              title={t("addressBook.modal.title")}
              onBack={() => setIsContactsOpen(false)}
            />
          }
          onSelect={(address) => {
            setValue("destAddress", address.address, { shouldValidate: true })
            setIsContactsOpen(false)
          }}
        />
      </Modal>
    </Stack>
  )
}
