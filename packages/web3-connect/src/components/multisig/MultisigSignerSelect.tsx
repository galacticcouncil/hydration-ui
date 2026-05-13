import { ChevronsDown } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  Box,
  Button,
  Collapsible,
  Flex,
  Grid,
  Icon,
  ModalContentDivider,
  Paper,
  Spinner,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  safeConvertSS58toPublicKey,
  stringEquals,
} from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"
import { difference, pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { AccountIdentity } from "@/components/account/AccountIdentity"
import { AccountOption } from "@/components/account/AccountOption"
import { SCopyButton } from "@/components/account/AccountOption.styled"
import { MultisigAccount } from "@/components/multisig/components/MultisigAccount"
import { ProviderInstalledButton } from "@/components/provider/ProviderInstalledButton"
import { SUBSTRATE_PROVIDERS } from "@/config/providers"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useActivateMultisig } from "@/hooks/useActivateMultisig"
import { useActiveMultisigConfig } from "@/hooks/useMultisigConfigs"
import { useWalletProviders } from "@/hooks/useWalletProviders"
import {
  useWeb3Connect,
  WalletMode,
  WalletProviderStatus,
} from "@/hooks/useWeb3Connect"
import { toAccount } from "@/utils/wallet"
import { getWalletData } from "@/wallets"

export const MultisigSignerSelect: React.FC = () => {
  const { t } = useTranslation()
  const { papi } = useWeb3ConnectContext()
  const config = useActiveMultisigConfig()

  const { accounts, getStatus, disconnect } = useWeb3Connect(
    useShallow(pick(["accounts", "getStatus", "disconnect"])),
  )

  const { activate } = useActivateMultisig()
  const { installed } = useWalletProviders(WalletMode.Substrate)

  if (!config) return null

  const unconnectedWallets = installed.filter(
    (w) => getStatus(w.provider) !== WalletProviderStatus.Connected,
  )

  const isAnyWalletConnecting = installed.some(
    (w) => getStatus(w.provider) === WalletProviderStatus.Pending,
  )

  const isAnyWalletConnected = installed.some(
    (w) => getStatus(w.provider) === WalletProviderStatus.Connected,
  )

  const substrateAccounts = accounts.filter((a) =>
    SUBSTRATE_PROVIDERS.includes(a.provider),
  )

  const isSignerAddress = (address: string) =>
    config.signers.some((signer) =>
      stringEquals(
        safeConvertSS58toPublicKey(signer),
        safeConvertSS58toPublicKey(address),
      ),
    )

  const handleSelectSigner = (signerAddress: string) => {
    activate(config, signerAddress)
  }

  const substrateSignerAccounts = substrateAccounts.filter((account) =>
    isSignerAddress(account.address),
  )

  const otherSignatories = difference(
    config.signers,
    substrateSignerAccounts.map((account) => account.address),
  )

  return (
    <Stack sx={{ minWidth: 0, width: "100%" }}>
      <MultisigAccount config={config} isActive />
      {!isAnyWalletConnected && (
        <Grid columns={[2, 3]} gap="base" mt="l">
          {unconnectedWallets.map((wallet) => {
            const data = getWalletData(wallet)
            return (
              <ProviderInstalledButton key={data.provider} walletData={data} />
            )
          })}
        </Grid>
      )}

      {isAnyWalletConnecting && (
        <Spinner size="2xl" sx={{ mx: "auto", my: "xl" }} />
      )}

      {isAnyWalletConnected && (
        <Stack sx={{ minWidth: 0, width: "100%" }}>
          <Icon
            component={ChevronsDown}
            mx="auto"
            my="base"
            size="l"
            color={getToken("text.medium")}
          />
          <Stack gap="base" sx={{ minWidth: 0, width: "100%" }}>
            {substrateSignerAccounts.length === 0 && (
              <Box maxWidth="4xl" mx="auto">
                <Text fs="p3" fw={500} align="center">
                  {t("multisig.signerSelect.noSignerAccounts.title")}
                </Text>
                <Text fs="p4" color={getToken("text.medium")} align="center">
                  {t("multisig.signerSelect.noSignerAccounts.description")}
                </Text>
                <Button
                  variant="secondary"
                  onClick={() => disconnect()}
                  size="medium"
                  mt="base"
                  mx="auto"
                >
                  {t("multisig.signerSelect.connectDifferentWallet")}
                </Button>
              </Box>
            )}
            {substrateSignerAccounts
              .filter((account) => isSignerAddress(account.address))
              .map((account) => (
                <AccountOption
                  key={`${account.publicKey}-${account.provider}`}
                  onSelect={() => handleSelectSigner(account.address)}
                  {...toAccount(account)}
                />
              ))}
          </Stack>
          {otherSignatories.length > 0 && (
            <>
              <ModalContentDivider my="m" />
              <Collapsible
                label={t("multisig.signerSelect.otherSignatories", {
                  count: otherSignatories.length,
                })}
                actionLabel={t("show")}
                actionLabelWhenOpen={t("hide")}
              >
                <Stack gap="base" sx={{ minWidth: 0, width: "100%" }}>
                  {otherSignatories.map((address) => (
                    <Flex key={address} align="center" gap="base" p="m" asChild>
                      <Paper borderRadius="m">
                        <Box sx={{ flexShrink: 0 }}>
                          <AccountAvatar address={address} />
                        </Box>
                        <Stack width="100%" minWidth="0">
                          <AccountIdentity
                            fs="p3"
                            papi={papi}
                            key={address}
                            address={address}
                          />
                          <Flex
                            align="center"
                            justify="space-between"
                            gap="base"
                          >
                            <Text
                              truncate
                              fs="p4"
                              color={getToken("text.medium")}
                            >
                              {address}
                            </Text>
                            <SCopyButton text={address} />
                          </Flex>
                        </Stack>
                      </Paper>
                    </Flex>
                  ))}
                </Stack>
              </Collapsible>
            </>
          )}
        </Stack>
      )}
    </Stack>
  )
}
