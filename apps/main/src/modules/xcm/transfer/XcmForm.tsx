import {
  Box,
  Flex,
  LoadingButton,
  Paper,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  useAccount,
  useWallet,
  useWeb3ConnectModal,
} from "@galacticcouncil/web3-connect"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useCrossChainBalance } from "@/api/xcm"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { ChainSwitch } from "@/modules/xcm/transfer/components/ChainSwitch"
import { ConnectButton } from "@/modules/xcm/transfer/components/ConnectButton"
import {
  AmountFormField,
  ChainAssetFormField,
} from "@/modules/xcm/transfer/components/FormField"
import { RecipientSelectButton } from "@/modules/xcm/transfer/components/Recipient"
import { useChainSwitch } from "@/modules/xcm/transfer/hooks/useChainSwitch"
import { useSubmitXcmTransfer } from "@/modules/xcm/transfer/hooks/useSubmitXcmTransfer"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { XcmSummary } from "@/modules/xcm/transfer/XcmSummary"

export const XcmForm = () => {
  const { t } = useTranslation("xcm")
  const { account } = useAccount()
  const wallet = useWallet()
  const { toggle } = useWeb3ConnectModal()
  const handleChainSwitch = useChainSwitch()

  const {
    transfer,
    sourceChainAssetPairs,
    destChainAssetPairs,
    isLoading: isDataLoading,
  } = useXcmProvider()

  const { setValue, watch, formState, handleSubmit } =
    useFormContext<XcmFormValues>()

  const [srcChain, srcAsset, destChain, destAsset, destAddress] = watch([
    "srcChain",
    "srcAsset",
    "destChain",
    "destAsset",
    "destAddress",
  ])

  const address = account?.address ?? ""
  const srcChainKey = srcChain?.key ?? ""
  const destChainKey = destChain?.key ?? ""

  const { data: srcBalances } = useCrossChainBalance(address, srcChainKey)
  const { data: destBalances } = useCrossChainBalance(address, destChainKey)

  const submit = useSubmitXcmTransfer()

  const isLoading = isDataLoading || submit.isPending

  return (
    <form
      onSubmit={handleSubmit(
        (values) => transfer && submit.mutate([values, transfer]),
      )}
    >
      <Stack gap={4} maxWidth={500} mx="auto" pt={20}>
        <Paper>
          <Box p={20}>
            <Text fs="h7" fw={500} align="center" font="primary">
              {t("form.title")}
            </Text>
          </Box>
          <Separator />
          <Stack p={20} gap={10}>
            <Flex justify="space-between">
              <Flex gap={10} direction="column">
                <Flex justify="space-between">
                  <Flex gap={4} align="center">
                    <Text fs="p5" color={getToken("text.medium")}>
                      {t("form.from")}
                    </Text>
                    <ConnectButton
                      walletProvider={wallet?.provider}
                      address={account?.displayAddress}
                      emptyFallback={t("form.connectWallet")}
                      onClick={() => toggle()}
                    />
                  </Flex>
                </Flex>
                <ChainAssetFormField
                  fieldName="srcAsset"
                  type="source"
                  chainAssetPairs={sourceChainAssetPairs}
                  selectedChain={srcChain}
                  setSelectedChain={(chain) => setValue("srcChain", chain)}
                  onAssetChange={() => {
                    setValue("srcAmount", "")
                    setValue("destAmount", "")
                  }}
                />
              </Flex>
              <AmountFormField
                fieldName="srcAmount"
                balance={srcBalances?.get(srcAsset?.key ?? "")}
                disabled={!srcAsset}
              />
            </Flex>
          </Stack>
        </Paper>

        <ChainSwitch onClick={handleChainSwitch} />

        <Paper>
          <Stack p={20} gap={10}>
            <Flex justify="space-between">
              <Flex gap={10} direction="column">
                <Flex justify="space-between">
                  <Flex gap={4} align="center">
                    <Text fs="p5" color={getToken("text.medium")}>
                      {t("form.to")}
                    </Text>
                    {destChain && destAsset && (
                      <RecipientSelectButton
                        value={destAddress}
                        onChange={(address, account) => {
                          setValue("destAddress", address)
                          setValue("destAccount", account ?? null)
                        }}
                      />
                    )}
                  </Flex>
                </Flex>
                <ChainAssetFormField
                  fieldName="destAsset"
                  type="destination"
                  disabled={!srcAsset}
                  chainAssetPairs={destChainAssetPairs}
                  selectedChain={destChain}
                  setSelectedChain={(chain) => setValue("destChain", chain)}
                />
              </Flex>
              <AmountFormField
                fieldName="destAmount"
                balance={destBalances?.get(destAsset?.key ?? "")}
                disabled
                showMaxButton={false}
                isLoading={formState.isValid && isDataLoading}
              />
            </Flex>
          </Stack>
          <Separator />
          <XcmSummary />
          <Stack p={20}>
            <AuthorizedAction size="large">
              <LoadingButton
                disabled={isLoading}
                isLoading={isLoading}
                type="submit"
                size="large"
              >
                {t("form.confirmSend")}
              </LoadingButton>
            </AuthorizedAction>
          </Stack>
        </Paper>
      </Stack>
    </form>
  )
}
