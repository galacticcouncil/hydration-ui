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
import { isNumber } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { AddressBookFormField } from "@/form/AddressBookFormField"
import { XcLogo } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/XcLogo"
import { XcChainAssetSelectFormField } from "@/modules/trade/swap/sections/XcSwap/components/XcChainAssetSelect"
import { XcSrcAssetSelectField } from "@/modules/trade/swap/sections/XcSwap/components/XcSrcAssetSelectField"
import {
  XcChain,
  XcChainAssetPair,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { XcSwapSwitcher } from "@/modules/trade/swap/sections/XcSwap/XcSwapSwitcher"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly destChainAssetPairs: XcChainAssetPair[]
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

export const XcSwapFields: React.FC<Props> = ({ destChainAssetPairs }) => {
  const { t } = useTranslation(["common"])
  const { watch, setValue } = useFormContext<XcSwapFormValues>()
  const { isCrossChain, isSelectionLoading, isQuoteLoading } = useXcSwap()
  const { getTransferableBalance } = useAccountBalances()
  const [isContactsOpen, setIsContactsOpen] = useState(false)

  const [srcChain, destChain, destAsset, destAmount] = watch([
    "srcChain",
    "destChain",
    "destAsset",
    "destAmount",
  ])
  const onChainDestAssetId =
    !isCrossChain && isNumber(destAsset?.id) ? String(destAsset.id) : ""
  const [destDisplayValue, { isLoading: isDestDisplayValueLoading }] =
    useDisplayAssetPrice(onChainDestAssetId, destAmount || "0")
  const destMaxBalance =
    onChainDestAssetId && destAsset
      ? scaleHuman(
          getTransferableBalance(onChainDestAssetId),
          destAsset.decimals,
        )
      : undefined

  return (
    <Stack>
      <XcSrcAssetSelectField
        label={<ChainLabel label={t("from")} chain={srcChain} />}
        loading={isSelectionLoading}
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
        ignoreBalance={isCrossChain}
        ignoreDisplayValue={isCrossChain}
        maxBalance={destMaxBalance}
        displayValue={!isCrossChain ? destDisplayValue : undefined}
        disabledInput
        loading={isSelectionLoading}
        valueLoading={isQuoteLoading}
        displayValueLoading={
          !isCrossChain && (isQuoteLoading || isDestDisplayValueLoading)
        }
      />

      {isCrossChain && (
        <>
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
                setValue("destAddress", address.address, {
                  shouldValidate: true,
                })
                setIsContactsOpen(false)
              }}
            />
          </Modal>
        </>
      )}
    </Stack>
  )
}
