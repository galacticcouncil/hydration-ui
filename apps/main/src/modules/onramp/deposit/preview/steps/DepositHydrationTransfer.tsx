import { Plus } from "@galacticcouncil/ui/assets/icons"
import {
  AccountTile,
  Button,
  Icon,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  Account,
  useWeb3Connect,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { FC, useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import { isHydrationDepositSource } from "@/modules/onramp/deposit/DepositLocalSource.utils"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { getPreferredDepositSourceAccount } from "@/modules/onramp/deposit/variants/DepositVariantSource.utils"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { TransferPositionModal } from "@/modules/portfolio/overview/Transfer/TransferPositionModal"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useRecentProviderAccountsStore } from "@/states/recentProviderAccounts"

import {
  SDepositHydrationTransfer,
  SDepositSourceAccount,
} from "./DepositHydrationTransfer.styled"

type DepositHydrationTransferProps = { onBack: () => void }

export const DepositHydrationTransfer: FC<DepositHydrationTransferProps> = ({
  onBack,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { papi } = useRpcProvider()
  const accounts = useDepositAccounts({ signersOnly: true })
  const active = useWeb3Connect((state) => state.account)
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const recentProviders = useWeb3Connect((state) => state.recentlyUsedProviders)
  const recentByProvider = useRecentProviderAccountsStore(
    (state) => state.recentByProvider,
  )
  const confirmedReceiver = useDepositJourneyStore(
    (state) => state.destinationAccount,
  )
  const receiver = useDepositJourneyStore(
    (state) => state.destinationAccount ?? state.suggestedDestinationAccount,
  )
  const [source, setSource] = useState<Account | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [choosingSource, setChoosingSource] = useState(false)
  // A suggested destination must not prevent reusing the active source account.
  const eligible = useCallback(
    (account: Account) => isHydrationDepositSource(account, confirmedReceiver),
    [confirmedReceiver],
  )
  const sources = accounts.filter(eligible)
  const select = useCallback(
    (account: Account) => {
      if (!eligible(account)) return
      setAccount(account)
      setSource(account)
      setConnecting(false)
      setChoosingSource(false)
    },
    [eligible, setAccount],
  )
  const sourceCurrent =
    source &&
    sources.some(
      (account) =>
        account.provider === source.provider &&
        account.address === source.address,
    ) &&
    active?.provider === source.provider &&
    active.address === source.address
  const preferred = getPreferredDepositSourceAccount(
    sources,
    active,
    recentProviders,
    recentByProvider,
  )
  useEffect(() => {
    if (!choosingSource && !connecting && !sourceCurrent && preferred)
      select(preferred)
  }, [choosingSource, connecting, sourceCurrent, preferred, select])
  const changeSource = () => {
    setChoosingSource(true)
    setSource(null)
  }

  if (connecting || (!choosingSource && !sourceCurrent && !preferred))
    return (
      <Web3ConnectPage
        neckwork={neckworkClient}
        papi={papi}
        mode={WalletMode.SubstrateEVM}
        accountFilter={eligible}
        meta={{
          title: t("deposit.local.sourceTitle"),
          description: t("deposit.local.sourceDescription"),
          closable: true,
          hideExternalWallet: true,
          hideMultisig: true,
        }}
        onBack={() => {
          setConnecting(false)
          if (sources.length) setChoosingSource(true)
          else onBack()
        }}
        onAccountSelect={select}
      />
    )

  if (sourceCurrent)
    return (
      <SDepositHydrationTransfer data-onramp-step="deposit-hydration-transfer">
        <TransferPositionModal
          key={`${source.provider}:${source.address}`}
          assetId="0"
          lockAsset
          sourceAccount={source}
          defaultRecipient={
            isHydrationDepositSource(source, receiver) ? receiver : undefined
          }
          onClose={() => useOnrampModal.getState().setModal(null)}
          header={(pending) => (
            <SDepositStepHeader
              title={t("deposit.local.title")}
              description={t("deposit.local.formDescription")}
              align="center"
              closable
              onBack={pending ? undefined : changeSource}
              customHeader={
                <Stack gap="s" pt="m">
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("deposit.quick.sourceWallet")}
                  </Text>
                  <SDepositSourceAccount
                    name={`${getWallet(source.provider)?.title ?? ""} · ${source.name}`}
                    address={source.displayAddress}
                    walletLogoSrc={getWallet(source.provider)?.logo}
                    width="100%"
                    action={
                      <Button
                        type="button"
                        variant="secondary"
                        outline
                        size="micro"
                        sx={{ py: "base" }}
                        uppercase
                        disabled={pending}
                        onClick={changeSource}
                      >
                        {t("common:change")}
                      </Button>
                    }
                  />
                </Stack>
              }
            />
          )}
        />
      </SDepositHydrationTransfer>
    )

  return (
    <>
      <SDepositStepHeader
        title={t("deposit.local.sourceTitle")}
        description={t("deposit.local.sourceDescription")}
        align="center"
        closable
        onBack={onBack}
      />
      <DepositScrollBody contained>
        <Stack
          gap="m"
          data-onramp-step="deposit-hydration-source"
          justify="flex-start"
        >
          {sources.map((account) => (
            <AccountTile
              key={`${account.provider}:${account.address}`}
              name={`${getWallet(account.provider)?.title ?? ""} · ${account.name}`}
              address={account.displayAddress}
              walletLogoSrc={getWallet(account.provider)?.logo}
              width="100%"
              sx={{ textAlign: "left" }}
              onClick={() => select(account)}
            />
          ))}
          {!sources.length && (
            <Text fs="p4" color={getToken("text.medium")}>
              {t("deposit.local.noSources")}
            </Text>
          )}
          <Button variant="tertiary" onClick={() => setConnecting(true)}>
            <Icon component={Plus} size="m" />
            {t("deposit.variants.connectAnother")}
          </Button>
        </Stack>
      </DepositScrollBody>
    </>
  )
}
