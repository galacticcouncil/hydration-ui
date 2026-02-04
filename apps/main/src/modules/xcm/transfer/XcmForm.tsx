import {
  Alert,
  Box,
  Flex,
  Paper,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { isAddressValidOnChain } from "@galacticcouncil/utils"
import { useAccount, useWeb3ConnectModal } from "@galacticcouncil/web3-connect"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useCrossChainBalance } from "@/api/xcm"
import { ChainAssetSelectModalSelectionChange } from "@/modules/xcm/transfer/components/ChainAssetSelect"
import { ChainSwitch } from "@/modules/xcm/transfer/components/ChainSwitch"
import { ConnectButton } from "@/modules/xcm/transfer/components/ConnectButton"
import {
  AmountFormField,
  ChainAssetFormField,
} from "@/modules/xcm/transfer/components/FormField"
import { RecipientSelectButton } from "@/modules/xcm/transfer/components/Recipient"
import { SubmitButton } from "@/modules/xcm/transfer/components/SubmitButton"
import { useChainSwitch } from "@/modules/xcm/transfer/hooks/useChainSwitch"
import { useResetAmounts } from "@/modules/xcm/transfer/hooks/useResetAmounts"
import { useSubmitXcmTransfer } from "@/modules/xcm/transfer/hooks/useSubmitXcmTransfer"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"
import { XcmTransferStatus } from "@/modules/xcm/transfer/utils/transfer"
import { XcmSummary } from "@/modules/xcm/transfer/XcmSummary"
import { useAssetPrice } from "@/states/displayAsset"

export const XcmForm = () => {
  const { t } = useTranslation(["common", "xcm"])
  const { account, isConnected } = useAccount()
  const { toggle } = useWeb3ConnectModal()
  const handleChainSwitch = useChainSwitch()

  const {
    status,
    transfer,
    sourceChainAssetPairs,
    destChainAssetPairs,
    isLoading,
    isLoadingCall,
    isLoadingTransfer,
    isConnectedAccountValid,
    registryChain,
  } = useXcmProvider()

  const { watch, formState, handleSubmit, reset, setValue } =
    useFormContext<XcmFormValues>()

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

  const submit = useSubmitXcmTransfer({
    onSubmitted: resetAmounts,
  })

  function onConnect() {
    if (!srcChain) return toggle()
    toggle(getWalletModeByChain(srcChain), {
      title: t("xcm:connect.modal.title", {
        chain: srcChain.name,
      }),
      description: t("xcm:connect.modal.description", {
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

  const isTranferValid =
    status === XcmTransferStatus.TransferValid ||
    status === XcmTransferStatus.ApproveAndTransferValid
  const isSubmitReady = formState.isValid && isTranferValid

  const spotPriceId = srcAsset
    ? registryChain.getBalanceAssetId(srcAsset).toString()
    : undefined

  const { price } = useAssetPrice(spotPriceId)

  const isLoadingCallOrTransfer = isLoadingCall || isLoadingTransfer

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
              <Flex gap="base" direction="column" flex={1} maxWidth="40%">
                <Flex gap="s" align="center">
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
                disabled={!srcAsset || !hasValidAccounts || isLoading}
                isLoading={isLoading}
                assetPrice={price}
                maxWidth="60%"
              />
            </Flex>
          </Stack>
        </Paper>

        <ChainSwitch onClick={handleChainSwitch} />

        <Paper>
          <Stack p={["l", "xl"]} gap="base">
            <Flex justify="space-between">
              <Flex gap="base" direction="column" flex={1} maxWidth="40%">
                <Flex gap="s" align="center">
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
                isLoading={isLoading}
                assetPrice={price}
                maxWidth="60%"
              />
            </Flex>
          </Stack>
          <XcmSummary />
          <Separator />
          <Box p={["l", "xl"]}>
            <SubmitButton
              status={status}
              disabled={
                isLoading ||
                isLoadingCallOrTransfer ||
                submit.isPending ||
                !isSubmitReady
              }
              isLoading={
                isLoading || isLoadingCallOrTransfer || submit.isPending
              }
              variant={isSubmitReady ? "primary" : "muted"}
              loadingVariant="muted"
              chain={srcChain}
            />
          </Box>
        </Paper>
        <Alert
          sx={{ mt: "xl" }}
          title={t("xcm:beta.title")}
          description={t("xcm:beta.description")}
        />
      </Stack>
    </form>
  )
}
