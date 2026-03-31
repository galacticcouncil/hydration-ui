import {
  AccountAvatar,
  Alert,
  Box,
  Flex,
  Grid,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { safeConvertAddressSS58, safeConvertSS58toPublicKey } from "@galacticcouncil/utils"

import { SAccountOption } from "@/components/account/AccountOption.styled"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { ProviderInstalledButton } from "@/components/provider/ProviderInstalledButton"
import { SUBSTRATE_PROVIDERS } from "@/config/providers"
import { useMultisigStore } from "@/hooks/useMultisigStore"
import {
  StoredAccount,
  useWeb3Connect,
  WalletMode,
  WalletProviderStatus,
} from "@/hooks/useWeb3Connect"
import { useWalletProviders } from "@/hooks/useWalletProviders"
import { toAccount } from "@/utils/wallet"
import { getWalletData } from "@/wallets"

export const MultisigSignerSelect: React.FC = () => {
  const { t } = useTranslation()
  const { getActiveConfig, setActive, activeConfigId } = useMultisigStore()
  const activeConfig = getActiveConfig()

  const { accounts, toggle, getStatus } = useWeb3Connect(
    useShallow(pick(["accounts", "toggle", "getStatus"])),
  )
  const { setAccount } = useWeb3Connect(useShallow(pick(["setAccount"])))

  const { installed } = useWalletProviders(WalletMode.Substrate)

  if (!activeConfig) return null

  // Only show buttons for wallets that are NOT yet connected — connected
  // wallets already contribute accounts to the list below.
  const unconnectedWallets = installed.filter(
    (w) => getStatus(w.provider) !== WalletProviderStatus.Connected,
  )

  const isAnyWalletConnecting = installed.some(
    (w) => getStatus(w.provider) === WalletProviderStatus.Pending,
  )

  // Filter to substrate accounts only
  const substrateAccounts = accounts.filter((a) =>
    SUBSTRATE_PROVIDERS.includes(a.provider),
  )

  const hasSubstrateAccounts = substrateAccounts.length > 0

  const isSignerAddress = (address: string) =>
    activeConfig.signers.some(
      (s) => safeConvertAddressSS58(s) === safeConvertAddressSS58(address),
    )

  const signerAccounts = substrateAccounts.filter((a) =>
    isSignerAddress(a.address),
  )
  const hasSigners = signerAccounts.length > 0

  const handleSelectSigner = (signerAddress: string) => {
    if (!activeConfigId) return

    const signerAccount = accounts.find((a) => a.address === signerAddress)
    if (!signerAccount) return

    const multisigAccount: StoredAccount = {
      name:
        activeConfig.name ||
        `${t("multisig.title")} (${activeConfig.threshold}/${activeConfig.signers.length})`,
      address: activeConfig.address,
      rawAddress: activeConfig.address,
      publicKey: safeConvertSS58toPublicKey(activeConfig.address),
      provider: signerAccount.provider,
      isMultisig: true,
      multisigConfigId: activeConfigId,
      multisigSignerAddress: signerAddress,
    }

    setActive(activeConfigId, signerAddress)
    setAccount(multisigAccount)
    toggle()
  }

  return (
    <Stack gap="var(--modal-content-padding)">
      {/* Multisig info */}
      <Stack
        gap="s"
        sx={{
          p: "m",
          borderRadius: "m",
          border: "1px solid",
          borderColor: "details.borders",
          bg: "surfaces.containers.dim.dimOnBg",
        }}
      >
        <Text fs="p4" fw={500}>
          {t("multisig.signerSelect.multisigLabel")}:{" "}
          {activeConfig.name
            ? `${activeConfig.name} (${activeConfig.threshold}/${activeConfig.signers.length})`
            : `${activeConfig.threshold}/${activeConfig.signers.length}`}
        </Text>
        <Text fs="p5" color={getToken("text.medium")}>
          {shortenAccountAddress(activeConfig.address)}
        </Text>
      </Stack>

      <Text fs="p4" color={getToken("text.medium")}>
        {t("multisig.signerSelect.description")}
      </Text>

      {/* Substrate wallet buttons — only for wallets not yet connected */}
      {unconnectedWallets.length > 0 && (
        <Grid columns={[2, 3]} gap="base">
          {unconnectedWallets.map((wallet) => {
            const data = getWalletData(wallet)
            return (
              <ProviderInstalledButton key={data.provider} walletData={data} />
            )
          })}
        </Grid>
      )}

      {/* Account list after wallet connects */}
      {isAnyWalletConnecting && (
        <Stack gap="s">
          <Skeleton height={48} />
          <Skeleton height={48} />
        </Stack>
      )}

      {!isAnyWalletConnecting && (
        <Stack gap="m">
          <Text fs="p4" fw={500}>
            {t("multisig.signerSelect.selectAccount")}
          </Text>

          {!hasSigners && (
            <Alert variant="warning" description={t("multisig.signerSelect.noSigners")} />
          )}

          {hasSigners && (
            <Stack gap="s">
              {signerAccounts.map((account) => {
                const accountDisplay = toAccount(account)

                return (
                  <SAccountOption
                    key={`${account.publicKey}-${account.provider}`}
                    onClick={() => handleSelectSigner(account.address)}
                  >
                    <Flex align="center" gap="m">
                      <Box sx={{ flexShrink: 0 }}>
                        <AccountAvatar address={accountDisplay.displayAddress} />
                      </Box>
                      <Flex direction="column" width="100%" sx={{ minWidth: 0 }}>
                        <Text fs="p3" truncate={200}>
                          {account.name}
                        </Text>
                        <Text
                          fs="p4"
                          color={getToken("text.medium")}
                          sx={{ minWidth: 0 }}
                        >
                          <Text as="span" truncate display={["none", "block"]}>
                            {accountDisplay.displayAddress}
                          </Text>
                          <Text as="span" display={["block", "none"]}>
                            {shortenAccountAddress(accountDisplay.displayAddress, 12)}
                          </Text>
                        </Text>
                      </Flex>
                    </Flex>
                  </SAccountOption>
                )
              })}
            </Stack>
          )}
        </Stack>
      )}

    </Stack>
  )
}
