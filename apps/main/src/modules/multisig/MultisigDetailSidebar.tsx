import { latestAccountBalanceQuery } from "@galacticcouncil/indexer/squid"
import { Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Chip,
  Flex,
  Icon,
  Paper,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  safeConvertSS58toPublicKey,
  stringEquals,
} from "@galacticcouncil/utils"
import {
  MultisigConfig,
  useAccount,
  useActivateMultisig,
} from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useSquidClient } from "@/api/provider"
import { MultisigSignatory } from "@/modules/multisig/MultisigSignatory"

type Props = {
  config: MultisigConfig
}

export const MultisigDetailSidebar: React.FC<Props> = ({ config }) => {
  const { t } = useTranslation()
  const squidSdk = useSquidClient()
  const publicKey = safeConvertSS58toPublicKey(config.address)
  const { account, accounts } = useAccount()
  const { activate } = useActivateMultisig()

  const { data: balanceData, isLoading: isBalanceLoading } = useQuery(
    latestAccountBalanceQuery(squidSdk, publicKey),
  )

  const balance = (() => {
    const node = balanceData?.accountTotalBalanceHistoricalData?.nodes.at(0)
    if (!node) return undefined
    const transferable = Number(node.totalTransferableNorm) || 0
    const locked = Number(node.totalLockedNorm) || 0
    return transferable + locked
  })()

  const connectedSignerAddress = account?.isMultisig
    ? account.multisigSignerAddress
    : account?.address

  const isSignatory =
    !!connectedSignerAddress &&
    config.signers.some((signer) =>
      stringEquals(
        safeConvertSS58toPublicKey(signer),
        safeConvertSS58toPublicKey(connectedSignerAddress),
      ),
    )

  const isConnectedAsThisMultisig =
    !!account?.isMultisig &&
    stringEquals(
      safeConvertSS58toPublicKey(account.address),
      safeConvertSS58toPublicKey(config.address),
    )

  const signerAccount = connectedSignerAddress
    ? accounts.find((a) =>
        stringEquals(
          safeConvertSS58toPublicKey(a.address),
          safeConvertSS58toPublicKey(connectedSignerAddress),
        ),
      )
    : undefined

  const showConnectButton =
    isSignatory && !isConnectedAsThisMultisig && !!signerAccount

  return (
    <Paper>
      <Stack separated>
        <Text fs="p1" lh={1.8} fw={500} font="primary" px="l" py="m">
          {t("multisig.detail.sidebar.title")}
        </Text>
        <Flex align="center" justify="space-between" px={["m", "l"]} py="m">
          <Text fs="p4" color={getToken("text.medium")}>
            {t("balance")}
          </Text>
          {isBalanceLoading ? (
            <Skeleton sx={{ width: 60, height: 20 }} />
          ) : (
            <Text fs="p4" fw={500}>
              {t("currency", { value: balance })}
            </Text>
          )}
        </Flex>
        <Flex align="center" justify="space-between" px={["m", "l"]} py="m">
          <Text fs="p4" color={getToken("text.medium")}>
            {t("multisig.detail.sidebar.threshold")}
          </Text>
          <Chip variant="green">
            {config.threshold}/{config.signers.length}
          </Chip>
        </Flex>
        <Box>
          <Text fs="p4" color={getToken("text.medium")} px={["m", "l"]} pt="m">
            {t("multisig.detail.sidebar.signatories", {
              count: config.signers.length,
            })}
          </Text>
          <Stack gap="base" pt="base" px={["m", "l"]} pb="m">
            {config.signers.map((address) => (
              <MultisigSignatory key={address} address={address} />
            ))}
          </Stack>
        </Box>
        {showConnectButton && (
          <Button
            sx={{
              borderRadius: 0,
              borderBottomLeftRadius: "xl",
              borderBottomRightRadius: "xl",
            }}
            variant="transparent"
            size="large"
            width="100%"
            onClick={() => activate(config, signerAccount.address)}
          >
            <Icon component={Wallet} size="m" />
            {t("multisig.detail.sidebar.connectAsMultisig")}
          </Button>
        )}
      </Stack>
    </Paper>
  )
}
