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
import { ConfigBuilder } from "@galacticcouncil/xcm-core"
import { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useCrossChainBalance, useHydrationConfigService } from "@/api/xcm"
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
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"
import { XcmSummary } from "@/modules/xcm/transfer/XcmSummary"
import { XcmTag } from "@/states/transactions"

enum RouteIndex {
  Wormhole = 0,
  Snowbridge = 1,
}

export const XcmForm = () => {
  const { t } = useTranslation("xcm")
  const { account } = useAccount()
  const wallet = useWallet()
  const { toggle } = useWeb3ConnectModal()
  const handleChainSwitch = useChainSwitch()

  const configService = useHydrationConfigService()

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

  const srcAddress = account?.rawAddress ?? ""
  const srcChainKey = srcChain?.key ?? ""
  const destChainKey = destChain?.key ?? ""

  const { data: srcBalances } = useCrossChainBalance(srcAddress, srcChainKey)
  const { data: destBalances } = useCrossChainBalance(destAddress, destChainKey)

  const submit = useSubmitXcmTransfer()

  const isLoading = isDataLoading || submit.isPending

  function onConnect() {
    if (!srcChain) return toggle()
    toggle(getWalletModeByChain(srcChain), {
      title: t("connect.modal.title", {
        chain: srcChain.name,
      }),
      description: t("connect.modal.description", {
        chain: srcChain.name,
      }),
    })
  }

  const { routes, config } = useMemo(() => {
    try {
      const configs =
        srcAsset && srcChain && destChain
          ? ConfigBuilder(configService)
              .assets()
              .asset(srcAsset)
              .source(srcChain)
              .destination(destChain)
          : null

      const routes = configs?.routes ?? []
      const config = destAsset ? configs?.build(destAsset) : null
      return { routes, config }
    } catch (error) {
      console.error(error)
      return {
        routes: [],
        config: null,
      }
    }
  }, [configService, srcAsset, srcChain, destChain, destAsset])

  const isWormhole = !!config?.origin?.route?.tags?.includes(XcmTag.Wormhole)
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(
    isWormhole ? RouteIndex.Wormhole : RouteIndex.Snowbridge,
  )

  const sortedRoutes = routes.sort((a, b) => {
    if (a.tags?.includes(XcmTag.Wormhole)) return -1
    if (b.tags?.includes(XcmTag.Wormhole)) return 1
    return 0
  })

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
                      onClick={onConnect}
                    />
                  </Flex>
                </Flex>
                <ChainAssetFormField
                  fieldName="srcAsset"
                  chainFieldName="srcChain"
                  type="source"
                  address={account?.rawAddress}
                  chainAssetPairs={sourceChainAssetPairs}
                  onSelectionConfirm={({ previousSelection, newSelection }) => {
                    if (
                      previousSelection?.chain?.key !== newSelection.chain.key
                    ) {
                      setValue("destAsset", null, { shouldDirty: true })
                    }
                  }}
                  onAssetChange={() => {
                    setValue("srcAmount", "")
                    setValue("destAmount", "")
                  }}
                />
              </Flex>
              <AmountFormField
                fieldName="srcAmount"
                balance={srcBalances?.get(srcAsset?.key ?? "")}
                balanceMax={transfer?.source.max}
                withMaxButton
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
                  chainFieldName="destChain"
                  type="destination"
                  address={destAddress}
                  disabled={!srcAsset}
                  chainAssetPairs={destChainAssetPairs}
                  onSelectionConfirm={({ previousSelection, newSelection }) => {
                    if (
                      previousSelection?.chain?.key !== newSelection.chain.key
                    ) {
                      setValue("srcAsset", null, { shouldDirty: true })
                      setValue("srcAmount", "")
                      setValue("destAmount", "")
                    }
                  }}
                />
              </Flex>
              <AmountFormField
                fieldName="destAmount"
                balance={destBalances?.get(destAsset?.key ?? "")}
                disabled
                isLoading={formState.isValid && isDataLoading}
              />
            </Flex>
          </Stack>

          <XcmSummary
            routes={sortedRoutes}
            selectedRouteIndex={selectedRouteIndex}
            setSelectedRouteIndex={setSelectedRouteIndex}
          />
          <Separator />
          <Stack p={20}>
            <AuthorizedAction size="large">
              <LoadingButton
                disabled={isLoading || !formState.isValid}
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
