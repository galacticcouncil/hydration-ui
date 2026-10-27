import {
  Button,
  ModalBody,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useCrossChainBalance, useHydrationAssetId } from "@/api/xcm"
import { OnrampAssetAmount } from "@/modules/onramp/components/OnrampAssetAmount"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { OnrampTransferSummary } from "@/modules/onramp/components/OnrampTransferSummary"
import { DepositAccountButton } from "@/modules/onramp/deposit/components/DepositAccountButton"
import { canUseDepositAccount } from "@/modules/onramp/deposit/DepositOnchain.utils"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import {
  insertOptimisticJourney,
  removeOptimisticJourney,
} from "@/modules/xcm/history/utils/optimistic"
import { RecipientSelectPage } from "@/modules/xcm/transfer/components/Recipient/RecipientSelectPage"
import { useResetAmounts } from "@/modules/xcm/transfer/hooks/useResetAmounts"
import { useSubmitXcmTransfer } from "@/modules/xcm/transfer/hooks/useSubmitXcmTransfer"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { XcmFooter } from "@/modules/xcm/transfer/XcmFooter"
import { useAssetPrice } from "@/states/displayAsset"

export const DepositOnchainForm = () => {
  const { t } = useTranslation(["onramp", "common"])
  const { account } = useAccount()
  const { transfer, isConnectedAccountValid, isLoadingSrcBalances } =
    useXcmProvider()
  const { watch, handleSubmit, setValue } = useFormContext<XcmFormValues>()
  const [srcChain, srcAsset, destAsset, destAccount, destAddress] = watch([
    "srcChain",
    "srcAsset",
    "destAsset",
    "destAccount",
    "destAddress",
  ])
  const isSourceCompatible =
    !!srcChain && canUseDepositAccount(account, srcChain)
  const paginateTo = useOnrampStore((state) => state.paginateTo)
  const page = useOnrampStore((state) => state.page)
  const selectRecipient = () => paginateTo(OnrampScreen.DepositOnchainRecipient)
  const queryClient = useQueryClient()
  const resetAmounts = useResetAmounts()
  const { data: balances } = useCrossChainBalance(
    isConnectedAccountValid ? (account?.address ?? "") : "",
    srcChain?.key ?? "",
  )
  const getHydrationAssetId = useHydrationAssetId()
  const { price } = useAssetPrice(
    srcAsset
      ? (getHydrationAssetId(srcAsset, srcChain?.key ?? "") ?? undefined)
      : undefined,
  )
  const submit = useSubmitXcmTransfer({
    automaticBridgeSelection: true,
    onTransferSubmitted: (txHash, values, transfer) => {
      if (account)
        insertOptimisticJourney(
          queryClient,
          account.address,
          txHash,
          values,
          transfer,
        )
      resetAmounts()
    },
    onTransferError: (txHash) => {
      if (account) removeOptimisticJourney(queryClient, account.address, txHash)
    },
  })
  const back = () => paginateTo(OnrampScreen.DepositOnchainAsset)

  if (page === OnrampScreen.DepositOnchainRecipient)
    return (
      <RecipientSelectPage
        onBack={() => paginateTo(OnrampScreen.DepositOnchainForm)}
        onSelectAddress={(address, recipient) => {
          setValue("destAddress", address, { shouldValidate: true })
          setValue("destAccount", recipient ?? null)
          paginateTo(OnrampScreen.DepositOnchainForm)
        }}
      />
    )

  return (
    <>
      <SOnrampStepHeader
        title={t("deposit.onchain.title")}
        onBack={back}
        align="center"
        closable
      />
      <ModalBody noPadding scrollable={false}>
        <Stack px={["l", "xl"]} py={["m", "l"]} gap="s">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("common:from")}
          </Text>
          {account && (
            <DepositAccountButton
              name={account.name}
              address={account.displayAddress}
              disabled={submit.isPending}
              onChange={() => paginateTo(OnrampScreen.DepositOnchainWallet)}
            />
          )}
        </Stack>
        <Separator />
        <OnrampAssetAmount
          label={t("deposit.onchain.asset")}
          selection={
            srcChain && srcAsset ? { chain: srcChain, asset: srcAsset } : null
          }
          onAssetClick={back}
          amountProps={{
            fieldName: "srcAmount",
            balance: balances?.get(srcAsset?.key ?? ""),
            balanceMax: transfer?.source.max,
            withMaxButton: true,
            assetPrice: price,
            isLoading: isLoadingSrcBalances,
            isBalanceLoading: isLoadingSrcBalances,
            disabled:
              !srcAsset ||
              !destAddress ||
              !isConnectedAccountValid ||
              !isSourceCompatible ||
              isLoadingSrcBalances,
          }}
        />
        <Separator />
        <Stack px={["l", "xl"]} py={["m", "l"]} gap="s">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.onchain.destination")}
          </Text>
          {destAddress ? (
            <DepositAccountButton
              active
              name={destAccount?.name ?? t("deposit.onchain.customAddress")}
              address={destAddress}
              disabled={submit.isPending}
              onChange={selectRecipient}
            />
          ) : (
            <Button variant="secondary" onClick={selectRecipient}>
              {t("deposit.onchain.selectDestination")}
            </Button>
          )}
          <Text fs="p5" color={getToken("text.low")}>
            {t("deposit.onchain.receiving", {
              symbol: destAsset?.originSymbol ?? "",
            })}
          </Text>
        </Stack>
        <OnrampTransferSummary />
        <Separator />
        <XcmFooter
          isSubmitting={submit.isPending}
          canSubmit={isSourceCompatible}
          onCancel={back}
          submitLabel={t("deposit.onchain.confirm")}
          onSubmit={() => {
            void handleSubmit((values) => {
              if (transfer && isSourceCompatible)
                submit.mutate([values, transfer])
            })()
          }}
        />
      </ModalBody>
    </>
  )
}
