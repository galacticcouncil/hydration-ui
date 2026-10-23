import { CaretDown } from "@galacticcouncil/ui/assets/icons"
import {
  AccountTile,
  Alert,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Icon,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  HYDRATION_CHAIN_KEY,
  shortenAccountAddress,
} from "@galacticcouncil/utils"
import {
  Account,
  AccountWalletAvatar,
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
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type DepositGuidedDestinationProps = {
  children: (state: {
    destination: (disabled: boolean) => ReactNode
    ready: boolean
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
    eligibleAccounts,
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
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            disabled={disabled || !eligibleAccounts.length}
          >
            <Button
              variant="ghost"
              width="100%"
              aria-label={t("deposit.guided.receivingAccount")}
              sx={{
                height: "auto",
                p: "m",
                borderRadius: "m",
                gridTemplateColumns: "minmax(0, 1fr)",
              }}
            >
              <Flex align="center" gap="m" width="100%">
                {current && (
                  <AccountWalletAvatar
                    address={current.displayAddress}
                    provider={current.provider}
                    size={36}
                  />
                )}
                <Stack gap="s" flex={1} minWidth={0} align="start">
                  <Text fs="p3" fw={500} truncate>
                    {current?.name ?? t("deposit.guided.selectReceiver")}
                  </Text>
                  {current && (
                    <Text fs="p5" color={getToken("text.medium")}>
                      {shortenAccountAddress(current.displayAddress)}
                    </Text>
                  )}
                </Stack>
                <Icon component={CaretDown} size="s" />
              </Flex>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            size="small"
            sideOffset={6}
            collisionPadding={12}
            sx={{
              width: "var(--radix-dropdown-menu-trigger-width)",
              maxHeight: "var(--radix-dropdown-menu-content-available-height)",
              overflowY: "auto",
            }}
          >
            {eligibleAccounts.map((account) => (
              <DropdownMenuItem
                key={`${account.provider}:${account.address}`}
                asChild
              >
                <AccountTile
                  name={`${getWallet(account.provider)?.title ?? ""} · ${account.name}`}
                  address={account.displayAddress}
                  walletLogoSrc={getWallet(account.provider)?.logo}
                  active={
                    current?.provider === account.provider &&
                    current.address === account.address
                  }
                  width="100%"
                  sx={{ textAlign: "left" }}
                  onClick={disabled ? undefined : () => setCandidate(account)}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="transparent"
          size="small"
          disabled={disabled}
          onClick={() => setConnecting(true)}
        >
          {t("deposit.guided.connectReceiver")}
        </Button>
        {selection && current && (
          <Alert
            variant={
              readinessError || needsActivation || bindingActivation
                ? "warning"
                : "info"
            }
            description={t(
              readinessError
                ? "deposit.v3.destination.unavailable"
                : needsActivation
                  ? "deposit.v3.destination.activation"
                  : bindingActivation
                    ? "deposit.v3.destination.binding"
                    : canContinue
                      ? "deposit.v3.destination.ready"
                      : "deposit.v3.destination.check",
              { symbol: symbol ?? "" },
            )}
          />
        )}
        {!selection && (
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.guided.chooseSourceFirst")}
          </Text>
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
