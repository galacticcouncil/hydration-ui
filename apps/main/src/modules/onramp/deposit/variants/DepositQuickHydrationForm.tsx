import {
  Alert,
  AssetButton,
  Box,
  Button,
  Flex,
  LoadingButton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
import {
  Account,
  useAccount,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { FC, ReactNode, useEffect, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { ChainLogo } from "@/components/ChainLogo"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { DepositAccountButton } from "@/modules/onramp/deposit/components/DepositAccountButton"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { DepositVariantForm } from "@/modules/onramp/deposit/variants/DepositVariantForm"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import {
  TransferPositionFormValues,
  useTransferPosition,
} from "@/modules/portfolio/overview/Transfer/TransferPosition.form"
import { useSubmitTransferPosition } from "@/modules/portfolio/overview/Transfer/TransferPositionModal.submit"
import { TransferPositionSummary } from "@/modules/portfolio/overview/Transfer/TransferPositionSummary"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  selection: { chain: AnyChain; asset: Asset }
  sourceAccount?: Account
  source: (disabled: boolean, showAssetSelector: boolean) => ReactNode
  assetSelector?: (disabled: boolean) => ReactNode
  onAssetClick: () => void
  onBack: () => void
}

/** The quick layout with the existing native HDX validation and submission. */
export const DepositQuickHydrationForm: FC<Props> = ({
  selection,
  sourceAccount,
  source,
  assetSelector,
  onAssetClick,
  onBack,
}) => {
  const { t } = useTranslation(["onramp", "common", "xcm"])
  const { papi } = useRpcProvider()
  const { tradable } = useAssets()
  const accounts = useDepositAccounts({ signersOnly: true })
  const { account: sourceSigner } = useAccount()
  const savedReceiver = useDepositJourneyStore(
    (state) => state.destinationAccount ?? state.suggestedDestinationAccount,
  )
  const [candidate, setCandidate] = useState<Account | null>(null)
  const receiver = [candidate, savedReceiver].find(
    (item) =>
      item?.canUseOnHydration &&
      accounts.some(
        (account) =>
          account.provider === item.provider &&
          account.address === item.address,
      ),
  )
  const [connecting, setConnecting] = useState(false)
  const setWalletContentWidth = useOnrampModal(
    (state) => state.setWalletContentWidth,
  )
  useEffect(() => {
    if (!connecting) return
    setWalletContentWidth(pxToRem(650))
    return () => setWalletContentWidth(null)
  }, [connecting, setWalletContentWidth])
  const { form, getMaxBalance } = useTransferPosition({ assetId: "0" })
  const [asset, amount, address] = form.watch(["asset", "amount", "address"])
  const { setValue } = form
  useEffect(() => {
    setValue("address", receiver?.rawAddress ?? "", {
      shouldValidate: !!sourceAccount,
    })
  }, [receiver?.rawAddress, sourceSigner?.publicKey, sourceAccount, setValue])
  const close = () => useOnrampModal.getState().setModal(null)
  const submit = useSubmitTransferPosition({ onClose: close })
  const sourceCurrent =
    !!sourceAccount &&
    sourceSigner?.provider === sourceAccount.provider &&
    sourceSigner.address === sourceAccount.address
  const eligibleReceiver = (account: Account) => account.canUseOnHydration

  if (connecting)
    return (
      <Web3ConnectPage
        layout="split"
        keepSplitOpen
        walletListVariant="connectedFirst"
        onContentWidthChange={setWalletContentWidth}
        neckwork={neckworkClient}
        papi={papi}
        mode={WalletMode.SubstrateEVM}
        accountFilter={eligibleReceiver}
        meta={{
          title: t("deposit.guided.receiverTitle"),
          description: t("deposit.guided.receiverDescription"),
          closable: true,
          hideExternalWallet: true,
          hideMultisig: true,
        }}
        onBack={() => setConnecting(false)}
        onAccountSelect={(account) => {
          if (!eligibleReceiver(account)) return
          setCandidate(account)
          useDepositJourneyStore
            .getState()
            .setDestination(account.rawAddress, account, {
              stayOnSources: true,
            })
          setConnecting(false)
        }}
      />
    )

  return (
    <FormProvider {...form}>
      <DepositVariantForm
        variant="simple"
        symbol={selection.asset.originSymbol}
        onBack={onBack}
        source={source(submit.isPending, false)}
        amount={
          <Box px={["l", "xl"]} py={["m", "l"]}>
            <AssetSelectFormField<TransferPositionFormValues>
              label={t("common:from")}
              labelAdornment={
                <Flex as="span" align="center" gap="s">
                  <ChainLogo
                    ecosystem={selection.chain.ecosystem}
                    chainId={getChainId(selection.chain)}
                    size="extra-small"
                    alt={selection.chain.name}
                  />
                  <Text fs="p5" fw={500}>
                    {selection.chain.name}
                  </Text>
                </Flex>
              }
              assetFieldName="asset"
              amountFieldName="amount"
              assets={tradable}
              assetSelector={
                assetSelector?.(submit.isPending) ?? (
                  <AssetButton
                    asset={{
                      symbol: selection.asset.originSymbol,
                      icon: <XAssetLogo {...selection} showChainLogo={false} />,
                    }}
                    onClick={onAssetClick}
                    isDisabled={submit.isPending}
                  />
                )
              }
              balance={sourceCurrent ? { value: getMaxBalance(asset) } : false}
              isDisabled={submit.isPending || !sourceCurrent || !receiver}
            />
          </Box>
        }
        destination={
          receiver ? (
            <Stack gap="base" data-onramp-step="deposit-guided-receiver">
              <Flex align="center" justify="space-between" gap="m">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("deposit.guided.receivingAccount")}
                </Text>
                <Text fs="p6" color={getToken("text.low")}>
                  {selection.chain.name}
                </Text>
              </Flex>
              <DepositAccountButton
                active
                name={receiver.name}
                address={receiver.displayAddress}
                disabled={submit.isPending}
                onChange={() => setConnecting(true)}
              />
              {sourceCurrent && form.formState.errors.address && (
                <Text fs="p5" color={getToken("accents.danger.emphasis")}>
                  {form.formState.errors.address.message}
                </Text>
              )}
            </Stack>
          ) : null
        }
        routeOptions={null}
        summary={
          <Box px={["l", "xl"]}>
            <TransferPositionSummary
              asset={asset}
              amount={amount}
              address={address}
              isSourceCurrent={sourceCurrent}
            />
          </Box>
        }
        notices={
          submit.error ? (
            <Alert variant="error" description={submit.error.message} />
          ) : null
        }
        footer={
          <Stack px={["l", "xl"]} py="l" gap="m">
            {!receiver ? (
              <Button size="large" onClick={() => setConnecting(true)}>
                {t("common:connectWallet")}
              </Button>
            ) : (
              <LoadingButton
                size="large"
                width="100%"
                disabledVariant="muted"
                loadingMode="replace"
                isLoading={submit.isPending}
                disabled={!sourceCurrent || !form.formState.isValid}
                onClick={() => {
                  void form.handleSubmit((values) => {
                    if (
                      sourceAccount &&
                      sourceSigner?.provider === sourceAccount.provider &&
                      sourceSigner.address === sourceAccount.address
                    )
                      submit.mutate(values)
                  })()
                }}
              >
                {t(
                  !sourceCurrent
                    ? "deposit.quick.chooseAccount"
                    : !amount
                      ? "xcm:form.amountMissing"
                      : "deposit.onchain.confirm",
                )}
              </LoadingButton>
            )}
            {!sourceCurrent && receiver && (
              <Text fs="p5" align="center" color={getToken("text.medium")}>
                {t("deposit.guided.chooseSourceFirst")}
              </Text>
            )}
          </Stack>
        }
      />
    </FormProvider>
  )
}
