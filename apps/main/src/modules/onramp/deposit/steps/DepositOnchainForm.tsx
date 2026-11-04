import { WalletIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  ModalBody,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HYDRATION_PARACHAIN_ID } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useCrossChainBalance, useHydrationAssetId } from "@/api/xcm"
import { ChainLogo } from "@/components/ChainLogo"
import { OnrampAssetAmount } from "@/modules/onramp/components/OnrampAssetAmount"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { OnrampTransferSummary } from "@/modules/onramp/components/OnrampTransferSummary"
import { DepositAccountButton } from "@/modules/onramp/deposit/components/DepositAccountButton"
import { DepositSameAccountAlert } from "@/modules/onramp/deposit/components/DepositSameAccountAlert"
import { isSameHydrationDepositAccount } from "@/modules/onramp/deposit/DepositOnchain.utils"
import { canUseDepositAccount } from "@/modules/onramp/deposit/DepositOnchain.utils"
import { DepositOnchainDestination } from "@/modules/onramp/deposit/steps/DepositOnchainDestination"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import {
  insertOptimisticJourney,
  removeOptimisticJourney,
} from "@/modules/xcm/history/utils/optimistic"
import { ChainAssetSelectContent } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
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
  const {
    transfer,
    isConnectedAccountValid,
    isLoadingSrcBalances,
    sourceChainAssetPairs,
  } = useXcmProvider()
  const { watch, handleSubmit, setValue } = useFormContext<XcmFormValues>()
  const [srcChain, srcAsset, destAccount, destAddress] = watch([
    "srcChain",
    "srcAsset",
    "destAccount",
    "destAddress",
  ])
  const sameAccount = isSameHydrationDepositAccount(
    account,
    srcChain?.key,
    destAddress,
  )
  const isSourceCompatible =
    !!srcChain && canUseDepositAccount(account, srcChain)
  const paginateTo = useOnrampStore((state) => state.paginateTo)
  const page = useOnrampStore((state) => state.page)
  const setModal = useOnrampModal((state) => state.setModal)
  const walletFirstFlow = useOnrampModal((state) => state.walletFirstFlow)
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
  const depositRecoveryId = useOnrampModal((state) => state.depositRecoveryId)
  const submit = useSubmitXcmTransfer({
    depositRecoveryId,
    recoverDeposit: true,
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
      setModal(null)
    },
    onTransferError: (txHash) => {
      if (account) removeOptimisticJourney(queryClient, account.address, txHash)
    },
  })
  const [selectingAsset, setSelectingAsset] = useState(false)
  const selectAsset = () => paginateTo(OnrampScreen.DepositOnchainAsset)
  const back = () =>
    paginateTo(
      walletFirstFlow === "connected"
        ? OnrampScreen.DepositOnchainDestination
        : OnrampScreen.DepositOnchainAsset,
    )

  const chooseDestination = (
    address: string,
    recipient?: typeof destAccount,
  ) => {
    setValue("destAddress", address, { shouldValidate: true })
    setValue("destAccount", recipient ?? null)
    paginateTo(OnrampScreen.DepositOnchainForm)
  }
  if (selectingAsset)
    return (
      <ChainAssetSelectContent
        embedded
        type="source"
        address={account?.address ?? ""}
        chainAssetPairs={sourceChainAssetPairs.filter(({ chain }) =>
          canUseDepositAccount(account, chain),
        )}
        currentSelection={
          srcChain && srcAsset ? { chain: srcChain, asset: srcAsset } : null
        }
        selectedChain={srcChain}
        onAssetSelect={({ chain, asset }) => {
          useOnrampModal.getState().setWalletFirstAsset({
            chainKey: chain.key,
            assetKey: asset.key,
          })
          void resetAmounts()
          setValue("srcChain", chain)
          setValue("srcAsset", asset)
          setSelectingAsset(false)
        }}
      />
    )

  if (page === OnrampScreen.DepositOnchainDestination)
    return (
      <DepositOnchainDestination
        onBack={selectAsset}
        onSelect={chooseDestination}
      />
    )
  if (page === OnrampScreen.DepositOnchainRecipient)
    return (
      <RecipientSelectPage
        onBack={() => paginateTo(OnrampScreen.DepositOnchainForm)}
        onSelectAddress={chooseDestination}
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
          variant="transaction"
          label={t("common:from")}
          selection={
            srcChain && srcAsset ? { chain: srcChain, asset: srcAsset } : null
          }
          onAssetClick={() => setSelectingAsset(true)}
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
          {sameAccount && (
            <DepositSameAccountAlert
              onChange={selectRecipient}
              disabled={submit.isPending}
            />
          )}
          {destAddress ? (
            <DepositAccountButton
              active
              name={destAccount?.name ?? t("deposit.onchain.customAddress")}
              address={destAddress}
              disabled={submit.isPending}
              onChange={selectRecipient}
            />
          ) : (
            <Button
              variant="secondary"
              size="large"
              iconStart={WalletIcon}
              onClick={selectRecipient}
            >
              {t("deposit.onchain.selectDestination")}
            </Button>
          )}
        </Stack>
        <OnrampTransferSummary receiveOnlyOnAssetChange />
        <Separator />
        <XcmFooter
          isSubmitting={submit.isPending}
          canSubmit={isSourceCompatible && !sameAccount}
          submitLabel={t("deposit.onchain.confirm")}
          onSubmit={() => {
            void handleSubmit((values) => {
              if (transfer && isSourceCompatible && !sameAccount)
                submit.mutate([values, transfer])
            })()
          }}
        />
      </ModalBody>
    </>
  )
}
