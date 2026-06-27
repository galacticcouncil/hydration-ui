import {
  Flex,
  Modal,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AddressBookModal, WalletMode } from "@galacticcouncil/web3-connect"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { isNumber } from "remeda"

import { TradeType } from "@/api/trade"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { AddressBookFormField } from "@/form/AddressBookFormField"
import { XcLogo } from "@/modules/trade/swap/sections/XcSwap/components/ChainAssetSelect/XcLogo"
import { XcChainAssetSelectFormField } from "@/modules/trade/swap/sections/XcSwap/components/XcChainAssetSelect"
import { XcSrcAssetSelectField } from "@/modules/trade/swap/sections/XcSwap/components/XcSrcAssetSelectField"
import {
  XcChain,
  XcChainAssetPair,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { useSwitchXcAssets } from "@/modules/trade/swap/sections/XcSwap/hooks/useSwitchXcAssets"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useXcSwapFormReset } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapFormReset"
import {
  getXcSwapBuyAssetOutId,
  isSameXcAsset,
} from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapAssets"
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
  const { t } = useTranslation(["common", "trade"])
  const navigate = useNavigate()
  const { watch, setValue, getValues } = useFormContext<XcSwapFormValues>()
  const { isCrossChain, isSelectionLoading, isQuoteLoading } = useXcSwap()
  const switchAssets = useSwitchXcAssets()
  const resetForm = useXcSwapFormReset()
  const { getTransferableBalance } = useAccountBalances()
  const [isContactsOpen, setIsContactsOpen] = useState(false)

  const handleSellAssetChange = useCallback(
    (
      sellAsset: NonNullable<XcSwapFormValues["sellAsset"]>,
      previousSellAsset: XcSwapFormValues["sellAsset"],
    ) => {
      const { buyAsset } = getValues()
      const isSwitch =
        buyAsset?.id !== undefined && sellAsset.id === String(buyAsset.id)

      if (isSwitch) {
        setValue("sellAsset", previousSellAsset)
        switchAssets()
        return
      }

      if (getValues("type") === TradeType.Sell) {
        resetForm()
      }

      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: sellAsset.id,
          assetOut: getXcSwapBuyAssetOutId(buyAsset) ?? search.assetOut,
        }),
        resetScroll: false,
      })
    },
    [getValues, navigate, resetForm, setValue, switchAssets],
  )

  const handleBuySelectionChange = useCallback(
    (selection: XcChainAssetPair, previousSelection: XcChainAssetPair) => {
      const { sellAsset } = getValues()
      const isSwitch =
        sellAsset &&
        selection.asset.id !== undefined &&
        sellAsset.id === String(selection.asset.id)

      if (isSwitch) {
        setValue("destChain", previousSelection.chain)
        setValue("buyAsset", previousSelection.asset)
        switchAssets()
        return
      }

      const chainChanged = selection.chain.key !== previousSelection.chain.key
      const assetChanged = !isSameXcAsset(
        selection.asset,
        previousSelection.asset,
      )

      if (chainChanged) {
        resetForm({ clearDestAddress: true })
      } else if (getValues("type") === TradeType.Buy && assetChanged) {
        resetForm()
      }

      const assetOut = getXcSwapBuyAssetOutId(selection.asset)

      if (assetOut) {
        navigate({
          to: ".",
          search: (search) => ({
            ...search,
            assetIn: sellAsset?.id,
            assetOut,
          }),
          resetScroll: false,
        })
      }
    },
    [getValues, navigate, resetForm, setValue, switchAssets],
  )

  const [srcChain, destChain, buyAsset, buyAmount, type] = watch([
    "srcChain",
    "destChain",
    "buyAsset",
    "buyAmount",
    "type",
  ])
  const isSell = type === TradeType.Sell
  const contactsWhitelist =
    destChain?.platform === "near"
      ? ([WalletMode.Near] as const)
      : destChain?.platform === "zec"
        ? ([WalletMode.Zcash] as const)
        : undefined
  const onChainDestAssetId =
    !isCrossChain && isNumber(buyAsset?.id) ? String(buyAsset.id) : ""
  const [destDisplayValue, { isLoading: isDestDisplayValueLoading }] =
    useDisplayAssetPrice(onChainDestAssetId, buyAmount || "0")
  const destMaxBalance =
    onChainDestAssetId && buyAsset
      ? scaleHuman(
          getTransferableBalance(onChainDestAssetId),
          buyAsset.decimals,
        )
      : undefined

  return (
    <Stack>
      <XcSrcAssetSelectField
        label={<ChainLabel label={t("from")} chain={srcChain} />}
        loading={isSelectionLoading}
        onAssetChange={handleSellAssetChange}
        onAmountChange={() => {
          if (!isSell) {
            setValue("type", TradeType.Sell)
          }
        }}
      />

      <XcSwapSwitcher />

      <XcChainAssetSelectFormField<XcSwapFormValues>
        chainFieldName="destChain"
        assetFieldName="buyAsset"
        amountFieldName="buyAmount"
        label={<ChainLabel label={t("to")} chain={destChain} />}
        chainAssetPairs={destChainAssetPairs}
        modalTitle={t("trade:xc.swap.field.destTitle")}
        hideMaxBalanceAction
        ignoreBalance={isCrossChain}
        ignoreDisplayValue={isCrossChain}
        ignoreErrors={isCrossChain}
        maxBalance={destMaxBalance}
        displayValue={!isCrossChain ? destDisplayValue : undefined}
        disabledInput={isCrossChain}
        loading={isSelectionLoading}
        valueLoading={isSell && isQuoteLoading}
        displayValueLoading={
          !isCrossChain && (isQuoteLoading || isDestDisplayValueLoading)
        }
        onSelectionChange={handleBuySelectionChange}
        onAmountChange={() => {
          if (isSell) {
            setValue("type", TradeType.Buy)
          }
        }}
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
              whitelist={contactsWhitelist}
              onBack={() => setIsContactsOpen(false)}
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
