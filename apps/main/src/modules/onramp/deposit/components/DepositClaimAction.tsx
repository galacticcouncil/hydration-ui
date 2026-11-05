import { Button, Stack, Text } from "@galacticcouncil/ui/components"
import {
  formatDestChainAddress,
  HYDRATION_CHAIN_KEY,
  useNow,
} from "@galacticcouncil/utils"
import {
  Account,
  useWeb3Connect,
  WalletMode,
  WalletProviderStatus,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { ClaimFlowModalButton } from "@/modules/xcm/history/components/ClaimFlowModalButton"
import { useDepositClaim } from "@/modules/xcm/history/hooks/useDepositClaim"
import { useJourneyRedeemed } from "@/modules/xcm/history/hooks/useJourneyRedeemed"
import { isJourneyClaimReady } from "@/modules/xcm/history/utils/claim"
import { useRpcProvider } from "@/providers/rpcProvider"

export const DepositClaimAction = ({
  journey,
  address,
}: {
  journey: XcJourney
  address: string
}) => {
  const { t } = useTranslation("onramp")
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const { papi } = useRpcProvider()
  const [selecting, setSelecting] = useState(false)
  const matches = (candidate: Account) => {
    if (
      !candidate.canUseOnHydration ||
      candidate.provider === WalletProviderType.ExternalWallet
    )
      return false
    const chain = chainsMap.get(HYDRATION_CHAIN_KEY)!
    try {
      const candidateAddress = formatDestChainAddress(
        candidate.rawAddress,
        chain,
      )
      return (
        !!candidateAddress &&
        candidateAddress === formatDestChainAddress(address, chain)
      )
    } catch {
      return false
    }
  }
  const receivers = useDepositAccounts({ signersOnly: true })
  const eligible = (candidate: Account) => {
    const wallets = useWeb3Connect.getState()
    return (
      matches(candidate) &&
      candidate.provider !== WalletProviderType.Multisig &&
      !candidate.isMultisig &&
      wallets.getStatus(candidate.provider) ===
        WalletProviderStatus.Connected &&
      wallets.accounts.some(
        (connected) =>
          connected.provider === candidate.provider &&
          connected.address === candidate.address,
      )
    )
  }
  const receiver = receivers.find(eligible)
  const mutation = useDepositClaim(journey)
  const now = useNow(isJourneyClaimReady(journey) ? null : 1000)
  const redeemed = useJourneyRedeemed(journey)
  if (receiver && !selecting)
    return (
      <Stack gap="m">
        <Text fs="p4">{t("deposit.flow.tracking.claimDescription")}</Text>
        {isJourneyClaimReady(journey, now) && redeemed.data === false && (
          <ClaimFlowModalButton
            type="deposit"
            journey={journey}
            mutation={mutation}
            depositAccount={receiver}
          />
        )}
      </Stack>
    )
  if (selecting)
    return (
      <Web3ConnectPage
        neckwork={neckworkClient}
        papi={papi}
        mode={WalletMode.SubstrateEVM}
        accountFilter={eligible}
        meta={{
          closable: true,
          title: t("deposit.flow.tracking.claimWallet"),
          description: t("deposit.flow.tracking.claimDescription"),
          hideExternalWallet: true,
        }}
        onBack={() => setSelecting(false)}
        onAccountSelect={(selected) => {
          if (!eligible(selected)) return
          setAccount(selected)
          setSelecting(false)
        }}
      />
    )
  return (
    <Stack gap="m">
      <Text fs="p4">{t("deposit.flow.tracking.claimDescription")}</Text>
      <Button variant="secondary" onClick={() => setSelecting(true)}>
        {t("deposit.flow.tracking.claimWallet")}
      </Button>
    </Stack>
  )
}
