import {
  Box,
  Flex,
  Paper,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { isAddressValidOnChain } from "@galacticcouncil/utils"
import { useAccount, useWeb3ConnectModal } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { useCrossChainBalance, useHydrationAssetId } from "@/api/xcm"
import { useZecWithdrawalsStore } from "@/modules/xcm/history/hooks/useZecWithdrawalsStore"
import { NEAR_CHAIN_KEY } from "@/modules/xcm/history/utils/journey"
import {
  insertOptimisticJourney,
  removeOptimisticJourney,
} from "@/modules/xcm/history/utils/optimistic"
import { BridgeSelector } from "@/modules/xcm/transfer/components/BridgeSelector"
import { ChainAssetSelectModalSelectionChange } from "@/modules/xcm/transfer/components/ChainAssetSelect"
import { ChainSwitch } from "@/modules/xcm/transfer/components/ChainSwitch"
import { ConnectButton } from "@/modules/xcm/transfer/components/ConnectButton"
import {
  AmountFormField,
  ChainAssetFormField,
} from "@/modules/xcm/transfer/components/FormField"
import {
  RecipientSelectButton,
  ZecWithdrawalNearAccount,
} from "@/modules/xcm/transfer/components/Recipient"
import { useChainSwitch } from "@/modules/xcm/transfer/hooks/useChainSwitch"
import { useResetAmounts } from "@/modules/xcm/transfer/hooks/useResetAmounts"
import { useSubmitXcmTransfer } from "@/modules/xcm/transfer/hooks/useSubmitXcmTransfer"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { isOneClickRoute } from "@/modules/xcm/transfer/utils/bridge"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"
import { XcmFooter } from "@/modules/xcm/transfer/XcmFooter"
import { XcmSummary } from "@/modules/xcm/transfer/XcmSummary"
import { useAssetPrice } from "@/states/displayAsset"

export const XcmForm = () => {
  const { t } = useTranslation(["common", "xcm"])
  const { account, isConnected } = useAccount()
  const { toggle } = useWeb3ConnectModal()
  const handleChainSwitch = useChainSwitch()

  const {
    transfer,
    sourceChainAssetPairs,
    destChainAssetPairs,
    availableBridgeRoutes,
    isLoadingSrcBalances,
    isLoadingDestBalances,
    isConnectedAccountValid,
    selectedRoute,
  } = useXcmProvider()

  const { watch, handleSubmit, reset, setValue } =
    useFormContext<XcmFormValues>()
  const { addWithdrawal, removeWithdrawal } = useZecWithdrawalsStore(
    useShallow(pick(["addWithdrawal", "removeWithdrawal"])),
  )

  const resetAmounts = useResetAmounts()

  const [srcChain, srcAsset, destChain, destAsset, destAddress] = watch([
    "srcChain",
    "srcAsset",
    "destChain",
    "destAsset",
    "destAddress",
  ])

  const srcAddress =
    isConnected && isConnectedAccountValid ? account.address : ""
  const srcChainKey = srcChain?.key ?? ""
  const destChainKey = destChain?.key ?? ""

  const { data: srcBalances } = useCrossChainBalance(srcAddress, srcChainKey)
  const { data: destBalances } = useCrossChainBalance(destAddress, destChainKey)

  const queryClient = useQueryClient()

  const isOneClick = isOneClickRoute(selectedRoute)

  const submit = useSubmitXcmTransfer({
    onTransferSubmitted: (txHash, values, transfer) => {
      // The claim on NEAR names the deposit address in plain, which the vaa
      // carries as a hash only
      if (transfer.deposit) {
        addWithdrawal({
          txHash,
          depositAddress: transfer.deposit.depositAddress,
          recipient: values.destAddress,
          deadline: transfer.deposit.deadline,
        })
      }

      if (account) {
        // A 1Click withdrawal lists as its leg to NEAR, the journey that
        // replaces this placeholder
        const hub = transfer.deposit ? chainsMap.get(NEAR_CHAIN_KEY) : undefined
        insertOptimisticJourney(
          queryClient,
          account.address,
          txHash,
          hub ? { ...values, destChain: hub } : values,
          transfer,
        )
      }

      resetAmounts()
    },
    onTransferError: (txHash, _values, transfer) => {
      // A transfer that failed leaves nothing to claim on NEAR
      if (transfer.deposit) removeWithdrawal(txHash)

      if (account) {
        removeOptimisticJourney(queryClient, account.address, txHash)
      }
    },
  })

  function onConnect() {
    if (!srcChain) return toggle()
    toggle(getWalletModeByChain(srcChain), {
      title: t("connectWallet.modal.title", {
        chain: srcChain.name,
      }),
      description: t("connectWallet.modal.description", {
        chain: srcChain.name,
      }),
    })
  }

  const handleSrcAssetChange = useCallback(
    ({
      previousSelection,
      newSelection,
    }: ChainAssetSelectModalSelectionChange) => {
      const isSameAsset =
        previousSelection?.asset?.key === newSelection.asset.key
      const isSameChain =
        previousSelection?.chain.key === newSelection.chain.key
      if (isSameAsset && isSameChain) return
      setValue("srcChain", newSelection.chain)
    },
    [setValue],
  )

  const handleDestAssetChange = useCallback(
    ({
      previousSelection,
      newSelection,
    }: ChainAssetSelectModalSelectionChange) => {
      const isSameAsset =
        previousSelection?.asset?.key === newSelection.asset.key
      const isSameChain =
        previousSelection?.chain.key === newSelection.chain.key

      if (isSameAsset && isSameChain) return

      if (isAddressValidOnChain(destAddress, newSelection.chain)) {
        return setValue("destChain", newSelection.chain)
      }

      return reset((prev) => ({
        ...prev,
        srcAmount: "",
        destAmount: "",
        destAddress: "",
        destAccount: null,
        destChain: newSelection.chain,
      }))
    },
    [setValue, destAddress, reset],
  )

  const hasValidAccounts = isConnectedAccountValid && !!destAddress

  const getHydrationAssetId = useHydrationAssetId()

  const spotPriceId = srcAsset
    ? (getHydrationAssetId(srcAsset, srcChainKey) ?? undefined)
    : undefined

  const { price } = useAssetPrice(spotPriceId)

  return (
    <form
      onSubmit={handleSubmit(
        (values) => transfer && submit.mutate([values, transfer]),
      )}
    >
      <Stack gap="s" maxWidth="6xl" mx="auto">
        <Paper>
          <Box p={["l", "xl"]}>
            <Text fs="h7" fw={500} align="center" font="primary">
              {t("xcm:form.title")}
            </Text>
          </Box>
          <Separator />
          <Stack p={["l", "xl"]} gap="base">
            <Flex justify="space-between">
              <Flex
                gap="base"
                direction="column"
                flex={1}
                position="relative"
                pt={pxToRem(26)}
              >
                <Flex
                  gap="s"
                  align="center"
                  position="absolute"
                  sx={{ top: 0, left: 0 }}
                >
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("from")}
                  </Text>
                  {isConnected && (
                    <ConnectButton
                      walletProvider={
                        isConnectedAccountValid ? account.provider : undefined
                      }
                      address={
                        isConnectedAccountValid
                          ? account.displayAddress
                          : undefined
                      }
                      placeholder={t("connectWallet")}
                      onClick={onConnect}
                    />
                  )}
                </Flex>
                <ChainAssetFormField
                  fieldName="srcAsset"
                  chainFieldName="srcChain"
                  type="source"
                  address={
                    isConnected && isConnectedAccountValid
                      ? account.address
                      : ""
                  }
                  chainAssetPairs={sourceChainAssetPairs}
                  onAssetChange={resetAmounts}
                  onSelectionConfirm={handleSrcAssetChange}
                />
              </Flex>
              <AmountFormField
                fieldName="srcAmount"
                balance={srcBalances?.get(srcAsset?.key ?? "")}
                balanceMax={transfer?.source.max}
                withMaxButton
                disabled={
                  !srcAsset || !hasValidAccounts || isLoadingSrcBalances
                }
                isLoading={isLoadingSrcBalances}
                isBalanceLoading={isLoadingSrcBalances}
                assetPrice={price}
              />
            </Flex>
          </Stack>
        </Paper>

        <ChainSwitch
          onClick={handleChainSwitch}
          disabled={!!transfer && !transfer.reversible}
        />

        <Paper>
          <Stack p={["l", "xl"]} gap="base">
            <Flex justify="space-between">
              <Flex
                gap="base"
                direction="column"
                flex={1}
                position="relative"
                pt={pxToRem(26)}
              >
                <Flex
                  gap="s"
                  align="center"
                  position="absolute"
                  sx={{ top: 0, left: 0 }}
                >
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("to")}
                  </Text>
                  {destChain && destAsset && (
                    <RecipientSelectButton
                      value={destAddress}
                      onChange={(address, account) => {
                        reset((prev) => ({
                          ...prev,
                          destAddress: address,
                          destAccount: account ?? null,
                        }))
                      }}
                    />
                  )}
                </Flex>
                <ChainAssetFormField
                  fieldName="destAsset"
                  chainFieldName="destChain"
                  type="destination"
                  address={destAddress}
                  disabled={!srcAsset}
                  chainAssetPairs={destChainAssetPairs}
                  onSelectionConfirm={handleDestAssetChange}
                />
              </Flex>
              <AmountFormField
                fieldName="destAmount"
                balance={destBalances?.get(destAsset?.key ?? "")}
                disabled
                isLoading={isLoadingDestBalances}
                isBalanceLoading={isLoadingDestBalances}
                assetPrice={price}
              />
            </Flex>
            {isOneClick && <ZecWithdrawalNearAccount />}
          </Stack>
          {availableBridgeRoutes.length > 1 && (
            <>
              <Separator />
              <Stack px={["l", "xl"]} py="m">
                <BridgeSelector routes={availableBridgeRoutes} />
              </Stack>
            </>
          )}
          <XcmSummary />
          <Separator />
          <XcmFooter isSubmitting={submit.isPending} />
        </Paper>
      </Stack>
    </form>
  )
}
