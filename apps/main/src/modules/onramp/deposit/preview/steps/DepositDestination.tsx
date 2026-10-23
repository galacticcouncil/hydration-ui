import { accountsBalancesQuery } from "@galacticcouncil/indexer/neckwork"
import {
  Alert,
  Button,
  ButtonTransparent,
  ModalFooter,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  Account,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { useQuery } from "@tanstack/react-query"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { DepositAccountButton } from "@/modules/onramp/deposit/components/DepositAccountButton"
import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import { useDepositRecipientReadiness } from "@/modules/onramp/deposit/hooks/useDepositRecipientReadiness"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useRpcProvider } from "@/providers/rpcProvider"

export const DepositDestination: FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { t } = useTranslation(["onramp", "common"])
  const rpc = useRpcProvider()
  const { setValue } = useFormContext<XcmFormValues>()
  const { destinationAccount, suggestedDestinationAccount, setPhase } =
    useDepositJourneyStore()
  const back = onBack ?? (() => setPhase("assets"))
  const [candidate, setCandidate] = useState<Account | null>(
    destinationAccount ?? suggestedDestinationAccount,
  )
  const {
    eligible,
    current,
    receiverAddress,
    symbol,
    needsActivation,
    bindingActivation,
    readinessError,
    ready,
    canContinue,
    retry,
    isFetching,
  } = useDepositRecipientReadiness(candidate)
  const [choosing, setChoosing] = useState(!candidate || !eligible(candidate))
  const balance = useQuery({
    ...accountsBalancesQuery(
      neckworkClient,
      current ? [current.publicKey] : [],
    ),
    enabled: !!current,
  })
  const value = balance.data?.find(
    (item) => item.account === current?.publicKey,
  )?.balance
  const isSuggested =
    current?.address === suggestedDestinationAccount?.address &&
    current?.provider === suggestedDestinationAccount?.provider
  const confirm = () => {
    if (!current || !canContinue || !receiverAddress) return
    setValue("destAddress", receiverAddress, { shouldValidate: true })
    setValue("destAccount", current)
    useDepositJourneyStore.getState().setDestination(receiverAddress, current)
  }
  if (choosing || !current)
    return (
      <Web3ConnectPage
        neckwork={neckworkClient}
        papi={rpc.papi}
        mode={WalletMode.SubstrateEVM}
        accountFilter={eligible}
        meta={{
          closable: true,
          title: t("deposit.v3.destination.title", { symbol: symbol ?? "" }),
          description: t("deposit.v3.destination.pick"),
          hideExternalWallet: true,
          hideMultisig: true,
        }}
        onBack={() => (current ? setChoosing(false) : back())}
        onAccountSelect={(account) => {
          if (eligible(account)) {
            setCandidate(account)
            setChoosing(false)
          }
        }}
      />
    )
  return (
    <>
      <SDepositStepHeader
        title={t("deposit.v3.destination.title", { symbol: symbol ?? "" })}
        align="center"
        closable
        onBack={back}
      />
      <DepositScrollBody>
        <Stack gap="xl" justify="flex-start">
          <Text fs="p4" color={getToken("text.medium")}>
            {t("deposit.v3.destination.arrivesIn")}
          </Text>
          {current && (
            <>
              {isSuggested && (
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("deposit.v3.destination.active")}
                </Text>
              )}
              <DepositAccountButton
                active
                name={`${getWallet(current.provider)?.title ?? ""} · ${current.name}`}
                address={current.displayAddress}
              />
              <Text fs="p4" color={getToken("text.medium")}>
                {value === undefined
                  ? t("deposit.v3.destination.balanceUnavailable")
                  : t("deposit.v3.destination.balance", { value })}
              </Text>
              <Alert
                variant={
                  needsActivation || bindingActivation || readinessError
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
                        : ready
                          ? "deposit.v3.destination.ready"
                          : "deposit.v3.destination.check",
                  { symbol: symbol ?? "" },
                )}
              />
            </>
          )}
          {(readinessError || needsActivation || bindingActivation) && (
            <Button variant="secondary" disabled={isFetching} onClick={retry}>
              {t("deposit.v3.destination.recheck")}
            </Button>
          )}
          <ButtonTransparent onClick={() => setChoosing(true)}>
            <Text fs="p4" color={getToken("textButtons.small.rest")}>
              {t("deposit.v3.destination.different")}
            </Text>
          </ButtonTransparent>
        </Stack>
      </DepositScrollBody>
      <ModalFooter>
        <Button variant="tertiary" size="large" width="100%" onClick={back}>
          {t("common:back")}
        </Button>
        <Button
          variant="secondary"
          size="large"
          width="100%"
          disabled={!canContinue}
          onClick={confirm}
        >
          {t("deposit.v3.destination.continue", { name: current?.name ?? "" })}
        </Button>
      </ModalFooter>
    </>
  )
}
