import {
  AccountTile,
  Button,
  Flex,
  ModalBody,
  ModalHeader,
  Separator,
  Stack,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HYDRATION_PARACHAIN_ID } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useCrossChainBalance, useHydrationAssetId } from "@/api/xcm"
import { ChainLogo } from "@/components/ChainLogo"
import { canUseDepositAccount } from "@/modules/onramp/deposit/onchain/DepositOnchain.utils"
import {
  insertOptimisticJourney,
  removeOptimisticJourney,
} from "@/modules/xcm/history/utils/optimistic"
import {
  AmountFormField,
  ChainAssetFormField,
} from "@/modules/xcm/transfer/components/FormField"
import { RecipientSelectButton } from "@/modules/xcm/transfer/components/Recipient"
import { useResetAmounts } from "@/modules/xcm/transfer/hooks/useResetAmounts"
import { useSubmitXcmTransfer } from "@/modules/xcm/transfer/hooks/useSubmitXcmTransfer"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  BRIDGE_TIME,
  getPrimaryBridgeTag,
  isOmniRoute,
} from "@/modules/xcm/transfer/utils/bridge"
import { XcmFooter } from "@/modules/xcm/transfer/XcmFooter"
import { XcmSummary } from "@/modules/xcm/transfer/XcmSummary"
import { useAssetPrice } from "@/states/displayAsset"

export type DepositOnchainFormProps = {
  onBack: () => void
  onSubmitted: (values: XcmFormValues) => void
}

const getRecipientAddress = ({ destAccount, destAddress }: XcmFormValues) =>
  destAccount?.rawAddress ?? destAddress

export const DepositOnchainForm: React.FC<DepositOnchainFormProps> = ({
  onBack,
  onSubmitted,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { account } = useAccount()
  const {
    transfer,
    selectedRoute,
    sourceChainAssetPairs,
    isLoadingSrcBalances,
    isConnectedAccountValid,
  } = useXcmProvider()
  const { watch, handleSubmit, setValue } = useFormContext<XcmFormValues>()
  const resetAmounts = useResetAmounts()
  const queryClient = useQueryClient()
  const submit = useSubmitXcmTransfer({
    onTransferSubmitted: (txHash, values, transfer) => {
      insertOptimisticJourney(
        queryClient,
        getRecipientAddress(values),
        txHash,
        values,
        transfer,
      )
      void resetAmounts()
      onSubmitted(values)
    },
    onTransferError: (txHash, values) => {
      removeOptimisticJourney(queryClient, getRecipientAddress(values), txHash)
    },
  })

  const [srcChain, srcAsset, destAsset, destAddress, destAmount] = watch([
    "srcChain",
    "srcAsset",
    "destAsset",
    "destAddress",
    "destAmount",
  ])

  const srcAddress = isConnectedAccountValid ? (account?.address ?? "") : ""
  const srcChainKey = srcChain?.key ?? ""
  const { data: srcBalances } = useCrossChainBalance(srcAddress, srcChainKey)

  const getHydrationAssetId = useHydrationAssetId()
  const { price } = useAssetPrice(
    srcAsset
      ? (getHydrationAssetId(srcAsset, srcChainKey) ?? undefined)
      : undefined,
  )

  const bridgeTag =
    selectedRoute && !isOmniRoute(selectedRoute)
      ? getPrimaryBridgeTag(selectedRoute)
      : null
  const estimatedTime = bridgeTag ? BRIDGE_TIME[bridgeTag] : undefined

  return (
    <form
      onSubmit={handleSubmit(
        (values) => transfer && submit.mutate([values, transfer]),
      )}
    >
      <ModalHeader
        title={t("deposit.onchain.title")}
        align="center"
        onBack={onBack}
        closable={false}
      />
      <ModalBody noPadding scrollable={false}>
        <Stack px={["l", "xl"]} py={["m", "l"]} gap="s">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.quick.sourceWallet")}
          </Text>
          {account && (
            <Flex align="center" gap="base">
              <AccountTile
                name={account.name}
                address={account.displayAddress}
                flex={1}
                minWidth={0}
              />
              <Button
                type="button"
                variant="secondary"
                outline
                size="small"
                disabled={submit.isPending}
                onClick={onBack}
              >
                {t("common:change")}
              </Button>
            </Flex>
          )}
        </Stack>
        <Separator />
        <Stack px={["l", "xl"]} py={["m", "l"]} gap="base">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("common:from")}
          </Text>
          <Flex justify="space-between" gap="base">
            <ChainAssetFormField
              fieldName="srcAsset"
              chainFieldName="srcChain"
              type="source"
              address={srcAddress}
              chainAssetPairs={sourceChainAssetPairs.filter(({ chain }) =>
                canUseDepositAccount(account, chain),
              )}
              onAssetChange={resetAmounts}
            />
            <AmountFormField
              fieldName="srcAmount"
              balance={srcBalances?.get(srcAsset?.key ?? "")}
              balanceMax={transfer?.source.max}
              withMaxButton
              disabled={
                !srcAsset ||
                !destAddress ||
                !isConnectedAccountValid ||
                isLoadingSrcBalances
              }
              isLoading={isLoadingSrcBalances}
              isBalanceLoading={isLoadingSrcBalances}
              assetPrice={price}
            />
          </Flex>
        </Stack>
        <Separator />
        <Flex
          px={["l", "xl"]}
          py={["m", "l"]}
          gap="s"
          align="center"
          justify="space-between"
        >
          <Flex align="center" gap="s">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("common:to")}
            </Text>
            <ChainLogo
              chainId={HYDRATION_PARACHAIN_ID}
              size="extra-small"
              alt="Hydration"
            />
            <Text fs="p5" fw={500} color={getToken("text.high")}>
              Hydration
            </Text>
          </Flex>
          <RecipientSelectButton
            value={destAddress}
            onChange={(address, recipient) => {
              setValue("destAddress", address, { shouldValidate: true })
              setValue("destAccount", recipient ?? null)
            }}
          />
        </Flex>
        <XcmSummary>
          {destAsset && (
            <SummaryRow
              label={t("transferSummary.receive")}
              content={
                destAmount
                  ? t("common:currency", {
                      value: destAmount,
                      symbol: destAsset.originSymbol,
                    })
                  : null
              }
            />
          )}
          {estimatedTime && (
            <SummaryRow
              label={t("transferSummary.time")}
              content={estimatedTime}
            />
          )}
        </XcmSummary>
        <Separator />
        <XcmFooter
          isSubmitting={submit.isPending}
          submitLabel={t("deposit.onchain.confirm")}
        />
      </ModalBody>
    </form>
  )
}
