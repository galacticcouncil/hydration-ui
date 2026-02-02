import {
  Alert,
  Box,
  Flex,
  Grid,
  Icon,
  Paper,
  Spinner,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useXcScan } from "@/modules/xcm/history/useXcScan"
import { XcScanJourneyList } from "@/modules/xcm/history/XcScanJourneyList"
import { XcmTransferApp } from "@/modules/xcm/transfer/XcmTransferApp"
import { useToasts } from "@/states/toasts"
import { TransactionType } from "@/states/transactions"

/* const networkToEcosystemName: Record<ChainEcosystem, string> = {
  [ChainEcosystem.Polkadot]: "polkadot",
  [ChainEcosystem.Kusama]: "kusama",
  [ChainEcosystem.Ethereum]: "ethereum",
  [ChainEcosystem.Solana]: "solana",
  [ChainEcosystem.Sui]: "sui",
} */

/* function getChainUrn(chainKey: string): string | null {
  const chain = chainsMap.get(chainKey)
  if (!chain || !chain.ecosystem) return null

  const ecosystemName = networkToEcosystemName[chain.ecosystem]
  if (!ecosystemName) return null

  let chainId: string
  if ("parachainId" in chain && chain.parachainId !== undefined) {
    chainId = chain.parachainId.toString()
  } else if (chain.isEvmChain() && "chainId" in chain) {
    chainId = (chain as { chainId: number }).chainId.toString()
  } else {
    chainId = chainKey
  }

  return `urn:ocn:${ecosystemName}:${chainId}`
} */

/* function toastToXcJourney(
  toast: { meta: ToastMeta; dateCreated: string; variant: string },
  accountAddress: string,
): XcJourney | null {
  const { meta, dateCreated, variant } = toast

  if (meta.type !== TransactionType.Xcm) return null

  const origin = getChainUrn(meta.srcChainKey)
  const destination = getChainUrn(meta.dstChainKey)

  if (!origin || !destination) return null

  const status =
    variant === "pending" || variant === "submitted" ? "sent" : "sent"

  const sentAt = new Date(dateCreated).getTime()

  return {
    origin,
    destination,
    assets: undefined,
    sentAt,
    correlationId: meta.txHash,
    status,
    from: accountAddress,
    fromFormatted: accountAddress,
    to: accountAddress,
    toFormatted: accountAddress,
    totalUsd: 0,
  } as unknown as XcJourney
} */

export const XcmPage = () => {
  const { t } = useTranslation(["xcm"])
  const { account } = useAccount()
  const address = account?.address ?? ""
  const { data } = useXcScan(address)

  const { toasts } = useToasts()

  const pendingToast = useMemo(() => {
    const latestToast = toasts[0]

    const isPendingXcmToast =
      latestToast &&
      latestToast.variant !== "error" &&
      latestToast.meta.type === TransactionType.Xcm &&
      !data?.some(
        (journey) => journey.originTxPrimary === latestToast.meta.txHash,
      )
    if (!isPendingXcmToast || !latestToast || !address) return null

    return latestToast
  }, [data, toasts, address])

  const alertNode = (
    <Alert
      sx={{ mt: "xl", gridColumn: [null, null, null, "span 2"] }}
      title={t("xcm:beta.title")}
      description={t("xcm:beta.description")}
    />
  )

  if (!account || data.length === 0) {
    return (
      <Stack maxWidth="6xl" mx="auto">
        <XcmTransferApp />
        {alertNode}
      </Stack>
    )
  }

  return (
    <Grid
      gap="xl"
      columnTemplate={["1fr", null, null, "1fr 1fr", "32rem 32rem"]}
      sx={{ justifyContent: "center" }}
    >
      <XcmTransferApp />
      <Stack gap="base" maxWidth="32rem" width="100%" mx="auto">
        {pendingToast && (
          <Flex as={Paper} p="m" gap="base" align="center">
            <Icon component={Spinner} size="s" />
            <Text fs="p5" fw={500} lh={1} color={getToken("text.medium")}>
              Waiting for transaction...
            </Text>
          </Flex>
        )}
        <Box>
          <XcScanJourneyList data={data} pageSize={4} />
        </Box>
      </Stack>
      {alertNode}
    </Grid>
  )
}
