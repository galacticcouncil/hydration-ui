import {
  Alert,
  Button,
  Flex,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import {
  Account,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { FC, ReactNode, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useDepositRecipientReadiness } from "@/modules/onramp/deposit/hooks/useDepositRecipientReadiness"
import { SDepositSourceAccount } from "@/modules/onramp/deposit/preview/steps/DepositHydrationTransfer.styled"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type DepositGuidedDestinationProps = {
  children: (state: {
    destination: (disabled: boolean) => ReactNode
    ready: boolean
    sourceHint: string | undefined
  }) => ReactNode
}

export const DepositGuidedDestination: FC<DepositGuidedDestinationProps> = ({
  children,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { papi } = useRpcProvider()
  const { watch, setValue } = useFormContext<XcmFormValues>()
  const [srcChain, srcAsset, destAddress, destAccount] = watch([
    "srcChain",
    "srcAsset",
    "destAddress",
    "destAccount",
  ])
  const { selectedRoute } = useXcmProvider()
  const selection = useDepositJourneyStore((state) => state.selection)
  const destination = useDepositJourneyStore(
    (state) => state.destinationAccount,
  )
  const suggested = useDepositJourneyStore(
    (state) => state.suggestedDestinationAccount,
  )
  const accounts = useDepositAccounts({ signersOnly: true })
  const [candidate, setCandidate] = useState<Account | null>(null)
  const [connecting, setConnecting] = useState(false)
  const preferred = [candidate, destination, suggested].find(
    (account) =>
      account?.canUseOnHydration &&
      accounts.some(
        (item) =>
          item.provider === account.provider &&
          item.address === account.address,
      ),
  )
  const {
    current,
    eligible,
    receiverAddress,
    symbol,
    ready,
    needsActivation,
    bindingActivation,
    readinessError,
    retry,
    isFetching,
  } = useDepositRecipientReadiness(
    preferred ?? accounts.find((account) => account.canUseOnHydration) ?? null,
  )
  const sourceReady =
    !!selection &&
    srcChain?.key === selection.chainKey &&
    srcAsset?.key === selection.assetKey &&
    selectedRoute?.source.asset.key === selection.assetKey &&
    selectedRoute.destination.chain.key === HYDRATION_CHAIN_KEY &&
    accounts.some(
      (account) =>
        account.provider === selection.account.provider &&
        account.address === selection.account.address,
    )
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
  const canContinue = sourceReady && ready && !!hydration
  useEffect(() => {
    if (!canContinue || !current || !receiverAddress || !hydration) {
      if (useDepositJourneyStore.getState().destinationConfirmed)
        useDepositJourneyStore.setState({ destinationConfirmed: false })
      return
    }
    setValue("destChain", hydration)
    setValue("destAddress", receiverAddress, { shouldValidate: true })
    setValue("destAccount", current)
    useDepositJourneyStore.getState().setDestination(receiverAddress, current, {
      stayOnSources: true,
    })
  }, [canContinue, current, receiverAddress, hydration, selection, setValue])

  if (connecting)
    return (
      <Web3ConnectPage
        neckwork={neckworkClient}
        papi={papi}
        mode={WalletMode.SubstrateEVM}
        accountFilter={eligible}
        meta={{
          title: t("deposit.guided.receiverTitle"),
          description: t("deposit.guided.receiverDescription"),
          closable: true,
          hideExternalWallet: true,
          hideMultisig: true,
        }}
        onBack={() => setConnecting(false)}
        onAccountSelect={(account) => {
          if (!eligible(account)) return
          setCandidate(account)
          setConnecting(false)
        }}
      />
    )

  return children({
    sourceHint: !selection ? t("deposit.guided.chooseSourceFirst") : undefined,
    ready:
      canContinue &&
      destAddress === receiverAddress &&
      destAccount?.provider === current?.provider &&
      destAccount?.address === current?.address,
    destination: (disabled) => (
      <Stack gap="base" data-onramp-step="deposit-guided-receiver">
        <Flex align="center" justify="space-between" gap="m">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.guided.receivingAccount")}
          </Text>
          <Text fs="p6" color={getToken("text.low")}>
            {hydration?.name}
          </Text>
        </Flex>
        {current ? (
          <SDepositSourceAccount
            name={current.name}
            address={current.displayAddress}
            walletLogoSrc={getWallet(current.provider)?.logo}
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
        ) : (
          <Button
            type="button"
            variant="tertiary"
            width="100%"
            disabled={disabled}
            onClick={() => setConnecting(true)}
          >
            {t("common:connectWallet")}
          </Button>
        )}
        {selection &&
          current &&
          (readinessError || needsActivation || bindingActivation) && (
            <Alert
              variant="warning"
              description={t(
                readinessError
                  ? "deposit.v3.destination.unavailable"
                  : needsActivation
                    ? "deposit.v3.destination.activation"
                    : "deposit.v3.destination.binding",
                { symbol: symbol ?? "" },
              )}
            />
          )}
        {(readinessError || needsActivation || bindingActivation) && (
          <Button
            variant="secondary"
            disabled={disabled || isFetching}
            onClick={retry}
          >
            {t("deposit.v3.destination.recheck")}
          </Button>
        )}
      </Stack>
    ),
  })
}
