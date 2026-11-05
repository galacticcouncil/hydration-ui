import { ArrowDown, RefreshCw } from "@galacticcouncil/ui/assets/icons"
import ErrorStatus from "@galacticcouncil/ui/assets/images/ErrorStatus.webp"
import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import {
  Alert,
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Image,
  ScrollArea,
  Spinner,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { useWeb3Connect } from "@galacticcouncil/web3-connect"
import {
  SModalBody,
  SSearchInput,
} from "@galacticcouncil/web3-connect/src/components/content/WalletManagementContent.styled"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { OnrampModalFooter } from "@/modules/onramp/components/OnrampModalFooter"
import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import {
  DepositBalanceRow,
  groupDepositBalances,
} from "@/modules/onramp/deposit/DepositDiscovery.utils"
import { useDepositDiscovery } from "@/modules/onramp/deposit/hooks/useDepositDiscovery"
import { DepositAssetGroupRow } from "@/modules/onramp/deposit/preview/components/DepositAssetGroupRow"
import { DepositUnavailableAssets } from "@/modules/onramp/deposit/preview/components/DepositUnavailableAssets"
import { DepositWalletList } from "@/modules/onramp/deposit/preview/components/DepositWalletList"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useResetAmounts } from "@/modules/xcm/transfer/hooks/useResetAmounts"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

export const DepositPreviewAsset = () => {
  const { t } = useTranslation(["onramp", "common"])
  const { gte } = useBreakpoints()
  const isMobile = !gte("sm")
  const [provider, setProvider] = useState<WalletProviderType | null>(null)
  const [search, setSearch] = useState("")
  const [chain, setChain] = useState("all")
  const data = useDepositDiscovery({ provider })
  const {
    destinationAddress,
    destinationAccount,
    suggestedDestinationAccount,
    setPhase,
  } = useDepositJourneyStore()
  const receiver = destinationAccount ?? suggestedDestinationAccount
  const queryClient = useQueryClient()
  const { setValue } = useFormContext<XcmFormValues>()
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const resetAmounts = useResetAmounts()
  const visibleRows = data.rows.filter(
    (row) =>
      (chain === "all" || row.source.chain.key === chain) &&
      `${row.balance.originSymbol} ${row.source.chain.name} ${row.source.account.name}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  )
  const visible = groupDepositBalances(visibleRows)
  const unavailable = data.unsupported.filter(
    (row) =>
      (chain === "all" || row.source.chain.key === chain) &&
      `${row.balance.originSymbol} ${row.source.chain.name} ${row.source.account.name}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  )
  const select = (row: DepositBalanceRow) => {
    setAccount(row.source.account)
    void resetAmounts()
    useDepositJourneyStore.getState().setAmount("")
    setValue("srcChain", row.source.chain)
    setValue(
      "srcAsset",
      row.source.assets.find((asset) => asset.key === row.balance.key) ??
        row.balance,
    )
    setValue("destAddress", destinationAddress)
    setValue("destAccount", destinationAccount)
    useDepositJourneyStore.getState().setSelection({
      account: row.source.account,
      chainKey: row.source.chain.key,
      assetKey: row.balance.key,
    })
  }
  return (
    <>
      <SDepositStepHeader
        title={t("deposit.v3.assets.title")}
        align="center"
        closable
        onBack={() => setPhase("sources")}
      />
      <SModalBody
        noPadding
        scrollable={false}
        display="flex"
        sx={{ minHeight: 0 }}
      >
        <Grid
          data-onramp-step="deposit-v3-assets"
          pt="m"
          columnTemplate={
            isMobile ? "minmax(0, 1fr)" : `${pxToRem(172)} minmax(0, 1fr)`
          }
          rowTemplate={isMobile ? "auto minmax(0, 1fr)" : "minmax(0, 1fr)"}
          gap={isMobile ? "base" : "s"}
          height={isMobile ? "100%" : `min(${pxToRem(560)}, 55vh)`}
          width="100%"
          sx={{ minHeight: 0 }}
        >
          <Box display="flex" sx={{ minHeight: 0, minWidth: 0 }}>
            <DepositWalletList
              compact={isMobile}
              showConnectedOnly
              selectedProvider={provider}
              onSelectProvider={(next) => {
                setProvider(next)
                setChain("all")
              }}
            />
          </Box>
          <Stack
            p={0}
            gap="m"
            justify="flex-start"
            minWidth={0}
            sx={{ minHeight: 0 }}
          >
            <SSearchInput
              customSize="large"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("deposit.v3.assets.search")}
              aria-label={t("deposit.v3.assets.search")}
            />
            <Box sx={{ overflowX: "auto", flexShrink: 0 }}>
              <Flex gap="s" width="max-content">
                <Button
                  variant={chain === "all" ? "secondary" : "transparent"}
                  size="small"
                  onClick={() => setChain("all")}
                >
                  {t("common:all")}
                </Button>
                {data.fundedChains.map((item) => (
                  <Button
                    key={item.key}
                    variant={chain === item.key ? "secondary" : "transparent"}
                    size="small"
                    onClick={() => setChain(item.key)}
                  >
                    {item.name}
                  </Button>
                ))}
              </Flex>
            </Box>
            <Flex align="center" justify="space-between" gap="m">
              <Stack gap="s" justify="flex-start">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("deposit.v3.assets.total")}
                </Text>
                <Text fs="h7" font="primary">
                  {data.pricesLoading ||
                  (visible.rows.length > 0 &&
                    visible.unpriced === visible.rows.length)
                    ? "—"
                    : t("common:currency", { value: visible.total })}
                </Text>
              </Stack>
              <Button
                variant="transparent"
                size="small"
                aria-label={t("deposit.flow.assets.refresh")}
                onClick={() => {
                  void queryClient.invalidateQueries({
                    queryKey: ["deposit", "balances"],
                  })
                }}
              >
                <Icon component={RefreshCw} size="m" />
              </Button>
            </Flex>
            {data.scanning && (
              <Flex gap="base" align="center">
                <Spinner size="s" />
                <Text fs="p6">{t("deposit.flow.assets.scanning")}</Text>
              </Flex>
            )}
            {data.failed > 0 && (
              <Alert
                variant="warning"
                description={t("deposit.flow.assets.partial", {
                  count: data.failed,
                })}
              />
            )}
            {visible.unpriced > 0 && (
              <Text fs="p6" color={getToken("text.low")}>
                {t("deposit.flow.assets.unpriced")}
              </Text>
            )}
            <Box flex={1} sx={{ minHeight: 0 }}>
              <ScrollArea height="100%">
                <Stack gap="s" justify="flex-start">
                  {visible.groups.map((group) => (
                    <DepositAssetGroupRow
                      key={group.key}
                      group={group}
                      onClick={() => select(group.rows[0]!)}
                    />
                  ))}
                  {!visible.groups.length && !data.scanning && (
                    <Stack py="xl" gap="m" align="center">
                      {!search && (
                        <Image
                          src={
                            data.failed === data.count && data.count > 0
                              ? ErrorStatus
                              : NoFunds
                          }
                          alt=""
                          aria-hidden
                          lazy={false}
                          sx={{ size: "3xl", objectFit: "contain" }}
                        />
                      )}
                      <Text fs="p3" fw={500}>
                        {t(
                          data.failed === data.count && data.count > 0
                            ? "deposit.flow.assets.unavailable"
                            : search
                              ? "deposit.cex.search.empty"
                              : "deposit.v3.assets.empty",
                        )}
                      </Text>
                      <Text
                        fs="p5"
                        color={getToken("text.medium")}
                        align="center"
                      >
                        {t("deposit.v3.assets.emptyDescription")}
                      </Text>
                      <Button
                        variant="secondary"
                        onClick={() => setPhase("sources")}
                      >
                        {t("deposit.flow.assets.connectMore")}
                      </Button>
                      <Button
                        variant="transparent"
                        onClick={() =>
                          useOnrampModal.getState().setModal("deposit")
                        }
                      >
                        {t("deposit.flow.sources.cex")}
                      </Button>
                    </Stack>
                  )}
                  <DepositUnavailableAssets rows={unavailable} />
                </Stack>
              </ScrollArea>
            </Box>
          </Stack>
        </Grid>
      </SModalBody>
      <OnrampModalFooter>
        <Flex
          data-onramp-destination
          width="100%"
          gap="m"
          align="center"
          justify="space-between"
        >
          <Flex gap="m" minWidth={0} flex={1} align="center">
            <Icon
              component={ArrowDown}
              size="l"
              color={getToken("text.tint.secondary")}
            />
            <Stack gap="s" minWidth={0} flex={1} justify="flex-start">
              <Text as="h3" fs="p3" fw={600}>
                {t("deposit.v3.assets.destination")}
              </Text>
              <Text fs="p5" color={getToken("text.medium")} truncate>
                {receiver
                  ? t("deposit.v3.assets.receiver", {
                      wallet: getWallet(receiver.provider)?.title ?? "",
                      account: receiver.name,
                    })
                  : t("deposit.v3.assets.receiverNext")}
              </Text>
              {receiver && (
                <Text
                  fs="p6"
                  color={getToken("text.low")}
                  title={destinationAddress || receiver.displayAddress}
                  truncate
                >
                  {destinationAddress || receiver.displayAddress}
                </Text>
              )}
            </Stack>
          </Flex>
          <Button
            variant="tertiary"
            size="small"
            flexShrink={0}
            onClick={() => setPhase("destination")}
          >
            {t("common:change")}
          </Button>
        </Flex>
      </OnrampModalFooter>
    </>
  )
}
