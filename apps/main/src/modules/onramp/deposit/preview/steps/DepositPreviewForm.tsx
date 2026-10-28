import {
  Alert,
  Button,
  Flex,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
import {
  Account,
  useAccount,
  useWeb3Connect,
} from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { Ntt } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQueryClient } from "@tanstack/react-query"
import { FC, ReactNode, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useCrossChainBalance, useHydrationAssetId } from "@/api/xcm"
import { ChainLogo } from "@/components/ChainLogo"
import { OnrampAssetAmount } from "@/modules/onramp/components/OnrampAssetAmount"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { OnrampTransferSummary } from "@/modules/onramp/components/OnrampTransferSummary"
import { DepositAccountButton } from "@/modules/onramp/deposit/components/DepositAccountButton"
import { DepositBalanceRow } from "@/modules/onramp/deposit/DepositDiscovery.utils"
import { canUseDepositAccount } from "@/modules/onramp/deposit/DepositOnchain.utils"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { DepositRouteSelect } from "@/modules/onramp/deposit/preview/components/DepositRouteSelect"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import { DepositSourceSelect } from "@/modules/onramp/deposit/preview/components/DepositSourceSelect"
import {
  getDepositFeeReserve,
  getDepositSourceFormValues,
  getDepositTokenProvenance,
} from "@/modules/onramp/deposit/preview/DepositTransfer.utils"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { DepositVariantForm } from "@/modules/onramp/deposit/variants/DepositVariantForm"
import { useOnrampReceiveEstimate } from "@/modules/onramp/hooks/useOnrampReceiveEstimate"
import {
  DepositVariant,
  useOnrampModal,
} from "@/modules/onramp/store/useOnrampModal"
import { createXcScanQueryKey } from "@/modules/xcm/history/useXcScan"
import {
  insertOptimisticJourney,
  removeOptimisticJourney,
} from "@/modules/xcm/history/utils/optimistic"
import { useSubmitXcmTransfer } from "@/modules/xcm/transfer/hooks/useSubmitXcmTransfer"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { getPrimaryBridgeTag } from "@/modules/xcm/transfer/utils/bridge"
import { XcmFooter } from "@/modules/xcm/transfer/XcmFooter"
import { useAssetPrice } from "@/states/displayAsset"
import { XcmTag } from "@/states/transactions"

type DepositPreviewFormProps = {
  variant?: DepositVariant
  symbol?: string
  source?: (disabled: boolean) => ReactNode
  destination?: (disabled: boolean) => ReactNode
  recipientReady?: boolean
  footerHint?: string
  onBack?: () => void
}

export const DepositPreviewForm: FC<DepositPreviewFormProps> = ({
  variant = "preview",
  symbol,
  source,
  destination,
  recipientReady = true,
  footerHint,
  onBack,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { account } = useAccount()
  const {
    transfer,
    selectedRoute,
    isConnectedAccountValid,
    isLoadingSrcBalances,
    isLoadingTransfer,
  } = useXcmProvider()
  const { watch, handleSubmit, getValues, reset, formState } =
    useFormContext<XcmFormValues>()
  const [srcChain, srcAsset, destAsset, destChain, destAccount, destAddress] =
    watch([
      "srcChain",
      "srcAsset",
      "destAsset",
      "destChain",
      "destAccount",
      "destAddress",
    ])
  const selection = useDepositJourneyStore((state) => state.selection)
  const destinationConfirmed = useDepositJourneyStore(
    (state) => state.destinationConfirmed,
  )
  const setPhase = useDepositJourneyStore((state) => state.setPhase)
  const setModal = useOnrampModal((state) => state.setModal)
  const sources = useDepositAccounts({ signersOnly: true })
  const selectedAccount = sources.find(
    (item) =>
      item.provider === selection?.account.provider &&
      item.address === selection?.account.address,
  )
  const isSourceCompatible =
    !!srcChain &&
    srcChain.key === selection?.chainKey &&
    srcAsset?.key === selection?.assetKey &&
    !!selectedAccount &&
    account?.address === selectedAccount.address &&
    account?.provider === selectedAccount.provider &&
    canUseDepositAccount(account, srcChain)
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const queryClient = useQueryClient()
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const bridgeTag = selectedRoute ? getPrimaryBridgeTag(selectedRoute) : null
  const provenance = getDepositTokenProvenance(bridgeTag)
  const arrivingToken = provenance
    ? t(`deposit.v3.token.${provenance}`, {
        symbol: destAsset?.originSymbol ?? "",
      })
    : (destAsset?.originSymbol ?? "")
  const requiresClaim =
    bridgeTag === XcmTag.Wormhole &&
    !!destChain &&
    !!destAsset &&
    !!Ntt.find(destChain, destAsset.key)
  const { data: balances } = useCrossChainBalance(
    isConnectedAccountValid ? (account?.address ?? "") : "",
    srcChain?.key ?? "",
  )
  const sourceBalance = balances?.get(srcAsset?.key ?? "")
  const reserved = !isLoadingTransfer
    ? getDepositFeeReserve(
        sourceBalance?.toDecimal(),
        transfer?.source.max.toDecimal(),
      )
    : undefined
  const getHydrationAssetId = useHydrationAssetId()
  const { price } = useAssetPrice(
    srcAsset
      ? (getHydrationAssetId(srcAsset, srcChain?.key ?? "") ?? undefined)
      : undefined,
  )
  const submit = useSubmitXcmTransfer({
    automaticBridgeSelection: true,
    onTransferSubmitted: (txHash, values, transfer) => {
      if (!account) return
      insertOptimisticJourney(
        queryClient,
        account.address,
        txHash,
        values,
        transfer,
      )
      const optimistic = queryClient
        .getQueryData<XcJourney[]>(createXcScanQueryKey(account.address))
        ?.find((journey) => journey.originTxPrimary === txHash)
      useDepositJourneyStore.getState().setSubmitted({
        txHash,
        sourceAddress: account.address,
        sourceProvider: account.provider,
        destinationAddress: values.destAddress,
        destinationName: values.destAccount?.name,
        destinationProvider: values.destAccount?.provider,
        sourceChainKey: values.srcChain?.key ?? "",
        symbol: values.srcAsset?.originSymbol ?? "",
        amount: values.srcAmount,
        receivedAmount: values.destAmount,
        receivedSymbol: values.destAsset?.originSymbol ?? "",
        receivedAssetKey: values.destAsset?.key,
        bridgeTag: values.bridgeProvider ?? bridgeTag,
        sentAt: Date.now(),
        optimistic,
        settled: false,
      })
      void queryClient.invalidateQueries({ queryKey: ["deposit", "balances"] })
    },
    onTransferError: (txHash) => {
      if (account) removeOptimisticJourney(queryClient, account.address, txHash)
      useDepositJourneyStore
        .getState()
        .updateSubmitted({ error: t("deposit.flow.tracking.failed") }, txHash)
    },
    onError: (message) => setSubmissionError(message),
  })
  const error = submissionError || submit.error?.message
  const hasNotices =
    (!isSourceCompatible && !!selection) || requiresClaim || !!error
  const receiveEstimate = useOnrampReceiveEstimate()
  const back =
    onBack ?? (() => setPhase(variant === "guided" ? "sources" : "assets"))
  const changeSource = (row: DepositBalanceRow, signer: Account) => {
    if (!canUseDepositAccount(signer, row.source.chain)) return
    setAccount(signer)
    reset(getDepositSourceFormValues(getValues(), row))
    useDepositJourneyStore.getState().setSelection({
      account: signer,
      chainKey: row.source.chain.key,
      assetKey: row.balance.key,
    })
    setSubmissionError(null)
    submit.reset()
  }
  const confirm = () => {
    void handleSubmit((values) => {
      if (
        transfer &&
        isSourceCompatible &&
        destinationConfirmed &&
        recipientReady &&
        !isLoadingTransfer
      ) {
        setSubmissionError(null)
        submit.mutate([values, transfer])
      }
    })()
  }

  if (variant !== "preview")
    return (
      <DepositVariantForm
        variant={variant}
        symbol={symbol ?? srcAsset?.originSymbol ?? ""}
        onBack={back}
        source={
          source?.(submit.isPending) ?? (
            <Flex align="center" justify="space-between" gap="m">
              <Stack gap="s" minWidth={0}>
                <Flex gap="s" align="center">
                  {srcChain && (
                    <ChainLogo
                      ecosystem={srcChain.ecosystem}
                      chainId={getChainId(srcChain)}
                      size="small"
                    />
                  )}
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("deposit.variants.fromNetwork", {
                      chain: srcChain?.name ?? "",
                    })}
                  </Text>
                </Flex>
                <Text fs="p4" fw={500} truncate>
                  {selectedAccount?.name ?? selection?.account.name} ·{" "}
                  {selection && getWallet(selection.account.provider)?.title}
                </Text>
              </Stack>
              <Button
                size="small"
                variant="tertiary"
                disabled={submit.isPending}
                onClick={() => setPhase("sources")}
              >
                {t("common:change")}
              </Button>
            </Flex>
          )
        }
        amount={
          <Stack pb={formState.errors.srcAmount ? ["l", 0] : 0}>
            <OnrampAssetAmount
              label={t("deposit.quick.amount")}
              selection={
                srcChain && srcAsset
                  ? { chain: srcChain, asset: srcAsset }
                  : null
              }
              amountProps={{
                fieldName: "srcAmount",
                balance: sourceBalance,
                balanceMax: !isLoadingTransfer
                  ? transfer?.source.max
                  : undefined,
                withMaxButton: true,
                assetPrice: price,
                isLoading: isLoadingSrcBalances,
                isBalanceLoading: isLoadingSrcBalances,
                disabled:
                  submit.isPending ||
                  !srcAsset ||
                  !destAddress ||
                  !destinationConfirmed ||
                  !recipientReady ||
                  !isConnectedAccountValid ||
                  !isSourceCompatible ||
                  isLoadingSrcBalances ||
                  isLoadingTransfer,
              }}
            />
            {reserved && (
              <Text px="xl" pb="m" fs="p5" color={getToken("text.medium")}>
                {t("deposit.v3.amount.feeReserve", {
                  amount: reserved,
                  symbol: srcAsset?.originSymbol,
                })}
              </Text>
            )}
          </Stack>
        }
        destination={
          <>
            {destination?.(submit.isPending) ?? (
              <Stack gap="s" minWidth={0}>
                <Flex gap="s" align="center">
                  {destChain && (
                    <ChainLogo
                      ecosystem={destChain.ecosystem}
                      chainId={getChainId(destChain)}
                      size="small"
                    />
                  )}
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("deposit.variants.toHydration")}
                    {destAccount &&
                      ` · ${getWallet(destAccount.provider)?.title ?? ""}`}
                  </Text>
                </Flex>
                <DepositAccountButton
                  active
                  name={destAccount?.name ?? t("deposit.onchain.customAddress")}
                  address={destAddress}
                  onClick={
                    submit.isPending ? undefined : () => setPhase("destination")
                  }
                />
              </Stack>
            )}
          </>
        }
        routeOptions={<DepositRouteSelect enabled={isSourceCompatible} />}
        notices={
          hasNotices ? (
            <>
              {!isSourceCompatible && selection && (
                <Alert
                  variant="warning"
                  description={t("deposit.flow.amount.sourceChanged")}
                  action={
                    selectedAccount && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setAccount(selectedAccount)}
                      >
                        {t("deposit.flow.amount.useSource")}
                      </Button>
                    )
                  }
                />
              )}
              {requiresClaim && (
                <Alert
                  variant="info"
                  description={t("deposit.v3.amount.claimRequired")}
                />
              )}
              {error && (
                <Alert
                  variant="error"
                  title={t("deposit.v3.amount.retryTitle")}
                  description={t("deposit.v3.amount.retryDescription", {
                    error,
                  })}
                />
              )}
            </>
          ) : null
        }
        summary={<OnrampTransferSummary />}
        footer={
          <>
            <XcmFooter
              isSubmitting={submit.isPending}
              canSubmit={
                isSourceCompatible && destinationConfirmed && recipientReady
              }
              onSubmit={confirm}
              submitLabel={t(
                error
                  ? "deposit.v3.amount.tryAgain"
                  : "deposit.onchain.confirm",
              )}
            />
            {footerHint && (
              <Text
                px="xl"
                pb="l"
                fs="p5"
                align="center"
                color={getToken("text.medium")}
              >
                {footerHint}
              </Text>
            )}
          </>
        }
      />
    )

  return (
    <>
      <SOnrampStepHeader
        title={t("deposit.v3.amount.title", {
          symbol: srcAsset?.originSymbol ?? "",
        })}
        onBack={back}
        align="center"
        closable
      />
      <DepositScrollBody noPadding>
        <Stack px="xl" py="l" gap="s" justify="flex-start">
          <DepositSourceSelect
            selection={selection}
            onSelect={changeSource}
            disabled={submit.isPending}
          />
        </Stack>
        {!isSourceCompatible && (
          <Stack px="xl" pb="m" gap="s">
            <Alert
              variant="warning"
              description={t("deposit.flow.amount.sourceChanged")}
            />
            {selectedAccount && (
              <Button
                variant="secondary"
                onClick={() => setAccount(selectedAccount)}
              >
                {t("deposit.flow.amount.useSource")}
              </Button>
            )}
          </Stack>
        )}
        <Separator />
        <OnrampAssetAmount
          label={t("deposit.onchain.asset")}
          selection={
            srcChain && srcAsset ? { chain: srcChain, asset: srcAsset } : null
          }
          onAssetClick={back}
          amountProps={{
            fieldName: "srcAmount",
            balance: sourceBalance,
            balanceMax: !isLoadingTransfer ? transfer?.source.max : undefined,
            withMaxButton: true,
            assetPrice: price,
            isLoading: isLoadingSrcBalances,
            isBalanceLoading: isLoadingSrcBalances,
            disabled:
              !srcAsset ||
              !destAddress ||
              !destinationConfirmed ||
              !isConnectedAccountValid ||
              !isSourceCompatible ||
              isLoadingSrcBalances ||
              isLoadingTransfer,
          }}
        />
        {reserved && (
          <Text px="xl" pb="m" fs="p5" color={getToken("text.medium")}>
            {t("deposit.v3.amount.feeReserve", {
              amount: reserved,
              symbol: srcAsset?.originSymbol,
            })}
          </Text>
        )}
        <Separator />
        <Stack px="xl" py="l" gap="s" justify="flex-start">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.v3.amount.receiveTo", {
              chain: destChain?.name ?? "Hydration",
            })}
            {destAccount &&
              ` · ${getWallet(destAccount.provider)?.title ?? ""}`}
          </Text>
          {destAddress ? (
            <DepositAccountButton
              active
              name={destAccount?.name ?? t("deposit.onchain.customAddress")}
              address={destAddress}
              onClick={() => setPhase("destination")}
            />
          ) : (
            <Button variant="secondary" onClick={() => setPhase("destination")}>
              {t("deposit.onchain.selectDestination")}
            </Button>
          )}
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.v3.amount.expectedToken")}
          </Text>
          <Text fs="p2" fw={600}>
            {!receiveEstimate.isLoading && receiveEstimate.amount
              ? t("common:currency", {
                  value: receiveEstimate.amount,
                  symbol: arrivingToken,
                })
              : "—"}
          </Text>
          {requiresClaim && (
            <Alert
              variant="info"
              description={t("deposit.v3.amount.claimRequired")}
            />
          )}
        </Stack>
        <DepositRouteSelect enabled={isSourceCompatible} />
        <Stack px="xl" py="m" gap="s">
          <Flex justify="space-between" gap="m">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("deposit.flow.amount.signing")}
            </Text>
            <Text fs="p5">
              {selection && getWallet(selection.account.provider)?.title}
            </Text>
          </Flex>
          {error && (
            <Alert
              variant="error"
              title={t("deposit.v3.amount.retryTitle")}
              description={t("deposit.v3.amount.retryDescription", { error })}
            />
          )}
        </Stack>
        <OnrampTransferSummary showReceive={false} />
        <Separator />
        <XcmFooter
          isSubmitting={submit.isPending}
          canSubmit={
            isSourceCompatible && destinationConfirmed && recipientReady
          }
          onCancel={() => setModal(null)}
          submitLabel={t(
            error ? "deposit.v3.amount.tryAgain" : "deposit.onchain.confirm",
          )}
          onSubmit={confirm}
        />
      </DepositScrollBody>
    </>
  )
}
