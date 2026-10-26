import { Plus } from "@galacticcouncil/ui/assets/icons"
import {
  AccountTile,
  Alert,
  Button,
  Icon,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  Account,
  useWeb3Connect,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { FC, useCallback, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import { canUseDepositAccount } from "@/modules/onramp/deposit/DepositOnchain.utils"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import { SDepositSourceAccount } from "@/modules/onramp/deposit/preview/steps/DepositHydrationTransfer.styled"
import { DepositPreviewForm } from "@/modules/onramp/deposit/preview/steps/DepositPreviewForm"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { DepositGuidedDestination } from "@/modules/onramp/deposit/variants/DepositGuidedDestination"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useRecentProviderAccountsStore } from "@/states/recentProviderAccounts"

import { getPreferredDepositSourceAccount } from "./DepositVariantSource.utils"

type DepositVariantSourceProps = {
  onBack?: () => void
  inlineDestination?: boolean
}

export const DepositVariantSource: FC<DepositVariantSourceProps> = ({
  onBack,
  inlineDestination = false,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { papi } = useRpcProvider()
  const { sourceChainAssetPairs } = useXcmProvider()
  const { getValues, reset } = useFormContext<XcmFormValues>()
  const accounts = useDepositAccounts({ signersOnly: true })
  const intent = useDepositJourneyStore((state) => state.assetIntent)
  const selection = useDepositJourneyStore((state) => state.selection)
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const activeAccount = useWeb3Connect((state) => state.account)
  const recentProviders = useWeb3Connect((state) => state.recentlyUsedProviders)
  const recentByProvider = useRecentProviderAccountsStore(
    (state) => state.recentByProvider,
  )
  const [connecting, setConnecting] = useState(false)
  const pair = sourceChainAssetPairs.find(
    ({ chain, assets }) =>
      chain.key === intent?.chainKey &&
      assets.some((asset) => asset.key === intent.assetKey),
  )
  const asset = pair?.assets.find((asset) => asset.key === intent?.assetKey)
  const eligible = (account: Account) =>
    !!pair && canUseDepositAccount(account, pair.chain)
  const compatible = accounts.filter(eligible)
  const back = () => {
    if (connecting && compatible.length) setConnecting(false)
    else if (onBack) onBack()
    else useDepositJourneyStore.getState().setPhase("catalog")
  }
  const select = useCallback(
    (account: Account) => {
      if (!pair || !asset || !canUseDepositAccount(account, pair.chain)) return
      const journey = useDepositJourneyStore.getState()
      if (
        inlineDestination &&
        journey.selection?.account.provider === account.provider &&
        journey.selection.account.address === account.address &&
        journey.selection.chainKey === pair.chain.key &&
        journey.selection.assetKey === asset.key
      ) {
        setConnecting(false)
        return
      }
      setAccount(account)
      reset({
        ...getValues(),
        srcChain: pair.chain,
        srcAsset: asset,
        srcAmount: "",
        destAsset: null,
        destAmount: "",
        bridgeProvider: null,
        destAddress: journey.destinationAddress,
        destAccount: journey.destinationAccount,
      })
      journey.setAmount("")
      journey.setSelection(
        {
          account,
          chainKey: pair.chain.key,
          assetKey: asset.key,
        },
        { stayOnSources: inlineDestination },
      )
      setConnecting(false)
    },
    [pair, asset, setAccount, reset, getValues, inlineDestination],
  )
  const selectedSource =
    selection &&
    selection.chainKey === pair?.chain.key &&
    selection.assetKey === asset?.key
      ? compatible.find(
          (account) =>
            account.provider === selection.account.provider &&
            account.address === selection.account.address,
        )
      : undefined
  const hasSelection = !!selectedSource
  const preferred = getPreferredDepositSourceAccount(
    compatible,
    activeAccount,
    recentProviders,
    recentByProvider,
  )
  useEffect(() => {
    if (inlineDestination && !connecting && !hasSelection && preferred)
      select(preferred)
  }, [inlineDestination, connecting, hasSelection, preferred, select])
  if (
    pair &&
    asset &&
    (connecting ||
      !compatible.length ||
      (inlineDestination && !hasSelection && !preferred))
  )
    return (
      <Web3ConnectPage
        neckwork={neckworkClient}
        papi={papi}
        mode={getWalletModeByChain(pair.chain)}
        accountFilter={eligible}
        meta={{
          title: t("deposit.variants.connectTitle", {
            symbol: asset.originSymbol,
          }),
          description: t("deposit.variants.connectDescription", {
            symbol: asset.originSymbol,
            chain: pair.chain.name,
          }),
          closable: true,
          hideAccountFilters: true,
          hideExternalWallet: true,
          hideMultisig: true,
        }}
        onBack={back}
        onAccountSelect={select}
      />
    )
  const content = (disabled = false) => (
    <Stack
      data-onramp-step="deposit-variant-source"
      gap={inlineDestination && selectedSource ? "base" : "l"}
      justify="flex-start"
    >
      {inlineDestination && selectedSource ? (
        <>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.quick.sourceWallet")}
          </Text>
          <SDepositSourceAccount
            name={`${getWallet(selectedSource.provider)?.title ?? ""} · ${selectedSource.name}`}
            address={selectedSource.displayAddress}
            walletLogoSrc={getWallet(selectedSource.provider)?.logo}
            width="100%"
            minWidth={0}
            action={
              <Button
                type="button"
                variant="secondary"
                outline
                size="micro"
                uppercase
                sx={{ py: "base", px: "m" }}
                disabled={disabled}
                onClick={() => setConnecting(true)}
              >
                {t("common:change")}
              </Button>
            }
          />
        </>
      ) : pair && asset ? (
        <>
          <Text fs="p4" color={getToken("text.medium")}>
            {t("deposit.variants.sourceDescription", {
              symbol: asset.originSymbol,
              chain: pair.chain.name,
            })}
          </Text>
          <Stack gap="m" justify="flex-start">
            {compatible.map((account) => (
              <AccountTile
                key={`${account.provider}:${account.address}`}
                name={`${getWallet(account.provider)?.title ?? ""} · ${account.name}`}
                address={account.displayAddress}
                walletLogoSrc={getWallet(account.provider)?.logo}
                active={
                  selection?.account.provider === account.provider &&
                  selection.account.address === account.address
                }
                width="100%"
                sx={{ textAlign: "left" }}
                onClick={disabled ? undefined : () => select(account)}
              />
            ))}
          </Stack>
          <Button
            variant="tertiary"
            disabled={disabled}
            onClick={() => setConnecting(true)}
          >
            <Icon component={Plus} size="m" />
            {t("deposit.variants.connectAnother")}
          </Button>
        </>
      ) : (
        <>
          <Alert
            variant="warning"
            description={t("deposit.variants.sourceUnavailable")}
          />
          <Button variant="secondary" disabled={disabled} onClick={back}>
            {t("deposit.variants.chooseAsset")}
          </Button>
        </>
      )}
    </Stack>
  )
  if (inlineDestination && pair && asset)
    return (
      <DepositGuidedDestination>
        {({ destination, ready }) => (
          <DepositPreviewForm
            key={`${selection?.account.provider}:${selection?.account.address}`}
            variant="guided"
            symbol={asset.originSymbol}
            source={content}
            destination={destination}
            recipientReady={ready}
            onBack={back}
          />
        )}
      </DepositGuidedDestination>
    )
  return (
    <>
      <SDepositStepHeader
        title={t("deposit.variants.sourceTitle")}
        align="center"
        closable
        onBack={back}
      />
      <DepositScrollBody>{content()}</DepositScrollBody>
    </>
  )
}
