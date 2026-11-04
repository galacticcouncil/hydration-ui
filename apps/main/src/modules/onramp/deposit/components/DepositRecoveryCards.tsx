import {
  Button,
  Flex,
  Notification,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { HexString, isAnyEvmChain } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import {
  DepositRecovery,
  useDepositRecoveryStore,
} from "@/modules/onramp/deposit/store/useDepositRecoveryStore"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { isDepositAccountAddress } from "@/modules/portfolio/deposits/PortfolioDepositActivity.utils"
import { useTransactionsStore } from "@/states/transactions"

const RecoveryCard = ({
  deposit,
  notification,
}: {
  deposit: DepositRecovery
  notification: boolean
}) => {
  const { t } = useTranslation("onramp")
  const accounts = useDepositAccounts({ signersOnly: true })
  const busy = useTransactionsStore((state) => state.transactions.length > 0)
  const source = accounts.find(
    (account) =>
      account.provider === deposit.source.provider &&
      isDepositAccountAddress(account.address, deposit.source.address),
  )
  const chain = chainsMap.get(deposit.chainKey)
  const receipt = useQuery({
    queryKey: ["deposit", "recoveryReceipt", deposit.chainKey, deposit.txHash],
    enabled:
      deposit.stage === "pending" &&
      !!deposit.txHash &&
      !!chain &&
      isAnyEvmChain(chain),
    queryFn: async () => {
      if (!chain || !isAnyEvmChain(chain) || !deposit.txHash) return null
      return chain.evmClient
        .getProvider()
        .getTransactionReceipt({ hash: deposit.txHash as HexString })
    },
    retry: false,
    refetchInterval: 10000,
  })
  useEffect(() => {
    if (receipt.data && deposit.stage === "pending" && !busy)
      useDepositRecoveryStore
        .getState()
        .update(deposit.id, { stage: "setup", txHash: undefined })
  }, [busy, deposit.id, deposit.stage, receipt.data])
  const submitted = useDepositJourneyStore(
    (state) =>
      state.pendingTransfers.find((item) => item.txHash === deposit.txHash) ??
      (state.submitted?.txHash === deposit.txHash ? state.submitted : null),
  )
  useEffect(() => {
    if (
      submitted &&
      (submitted.settled !== !!deposit.settled ||
        submitted.error !== deposit.error)
    )
      useDepositRecoveryStore.getState().update(deposit.id, {
        settled: submitted.settled,
        error: submitted.error,
      })
  }, [submitted, deposit.id, deposit.settled, deposit.error])
  const status =
    deposit.stage === "transfer"
      ? deposit.error
        ? "failed"
        : !deposit.txHash
          ? "uncertain"
          : submitted?.settled || deposit.settled
            ? "completed"
            : "tracking"
      : deposit.stage === "pending"
        ? "pending"
        : "setup"
  const title = t(`deposit.recovery.${status}`)
  const description = `${deposit.amount} ${deposit.symbol} · ${chain?.name ?? deposit.chainKey} → Hydration`
  const resume = () => {
    if (!source || busy || deposit.stage !== "setup") return
    useOnrampModal.getState().openOnchain("connected", {
      assetIntent: { chainKey: deposit.chainKey, assetKey: deposit.assetKey },
    })
    useOnrampModal.setState({
      depositSourceAccount: source,
      depositRecoveryId: deposit.id,
    })
    useOnrampStore.getState().paginateTo(OnrampScreen.DepositOnchainForm)
  }
  const action =
    deposit.stage === "transfer" ? (
      deposit.txHash && submitted ? (
        <Button
          size="small"
          variant="secondary"
          onClick={() =>
            useOnrampModal
              .getState()
              .openOnchain("simple", { resume: true, txHash: deposit.txHash })
          }
        >
          {t("deposit.recovery.view")}
        </Button>
      ) : (
        <Button size="small" variant="secondary" asChild>
          <Link to="/cross-chain/history">{t("deposit.recovery.check")}</Link>
        </Button>
      )
    ) : (
      <Button
        size="small"
        variant="secondary"
        disabled={busy || !source || deposit.stage === "pending"}
        onClick={resume}
      >
        {t("deposit.recovery.continue")}
      </Button>
    )
  const hint =
    deposit.stage === "transfer" && !deposit.txHash
      ? t("deposit.recovery.unknown")
      : !source
        ? t("deposit.recovery.connect")
        : deposit.stage === "pending"
          ? t("deposit.recovery.wait")
          : ""
  if (notification)
    return (
      <Notification
        fullWidth
        autoClose={false}
        variant="info"
        content={title}
        description={`${description}${hint ? ` — ${hint}` : ""}`}
        actions={action}
      />
    )
  return (
    <Flex
      align="center"
      justify="space-between"
      gap="m"
      p="l"
      borderRadius="m"
      bg="surfaces.containers.dim.dimOnHigh"
      wrap
    >
      <Stack gap="xs" flex={1}>
        <Text fs="p4" fw={500}>
          {title}
        </Text>
        <Text fs="p5" color="text.medium">
          {description}
        </Text>
        {hint && (
          <Text fs="p5" color="text.medium">
            {hint}
          </Text>
        )}
      </Stack>
      {action}
    </Flex>
  )
}
export const DepositRecoveryCards = ({
  notification = false,
}: {
  notification?: boolean
}) => {
  const { account } = useAccount()
  const deposits = useDepositRecoveryStore((state) => state.deposits)
  return (
    <>
      {deposits
        .filter(
          (deposit) =>
            isDepositAccountAddress(deposit.source.address, account?.address) ||
            isDepositAccountAddress(
              deposit.destinationAddress,
              account?.address,
            ),
        )
        .map((deposit) => (
          <RecoveryCard
            key={deposit.id}
            deposit={deposit}
            notification={notification}
          />
        ))}
    </>
  )
}
