import { Plus, WalletIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  ScrollArea,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  getWalletGroupSourceModes,
  getWalletPrimaryMode,
  getWalletSourceModeLabel,
  getWalletSourceModes,
  SScrollAreaContent,
  SSearchInput,
  SSourceColumn,
  SSourceScrollFrame,
  WalletProviderStatus,
  WalletSourceButton,
  WalletSourceCategoryLabel,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { LucideWallet } from "lucide-react"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { useUnmount } from "react-use"

import { useDepositWallets } from "@/modules/onramp/deposit/onchain/hooks/useDepositWallets"

export type DepositWalletListProps = {
  selectedProvider?: WalletProviderType | null
  onSelectProvider?: (provider: WalletProviderType | null) => void
  showConnectedOnly?: boolean
}

export const DepositWalletList: FC<DepositWalletListProps> = ({
  selectedProvider = null,
  onSelectProvider,
  showConnectedOnly = false,
}) => {
  const { t } = useTranslation("onramp")
  const [search, setSearch] = useState("")
  const [showMore, setShowMore] = useState(false)
  const wallets = useDepositWallets()
  useUnmount(wallets.cancelQueue)

  const term = search.trim().toLowerCase()
  const hasConnectedWallets = wallets.connectedGroups.length > 0
  const showAvailableWallets = showMore || !hasConnectedWallets || !!term
  const groups = wallets.groups.filter(
    (group) =>
      group.title.toLowerCase().includes(term) &&
      (!showConnectedOnly ||
        !hasConnectedWallets ||
        group.providers.some(
          (provider) =>
            wallets.connectedProviders.has(provider) ||
            wallets.queue.includes(provider),
        )),
  )
  const otherWallets = wallets.otherWallets.filter((wallet) =>
    wallet.title.toLowerCase().includes(term),
  )
  const statusForGroup = (providers: WalletProviderType[]) => {
    if (
      providers.includes(wallets.currentProvider as WalletProviderType) ||
      wallets.providers.some(
        (provider) =>
          providers.includes(provider.type) &&
          provider.status === WalletProviderStatus.Pending,
      )
    )
      return "pending"
    if (providers.some((provider) => wallets.results[provider] === "waiting"))
      return "waiting"
    if (
      providers.some(
        (provider) =>
          !wallets.connectedProviders.has(provider) &&
          wallets.results[provider] === "rejected",
      )
    )
      return "rejected"
    if (
      providers.some(
        (provider) =>
          !wallets.connectedProviders.has(provider) &&
          wallets.results[provider] === "skipped",
      )
    )
      return "skipped"
    if (providers.some((provider) => wallets.connectedProviders.has(provider)))
      return "connected"
    return "connect"
  }

  return (
    <SSourceColumn mobileHidden={false}>
      <SSearchInput
        customSize="large"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t("deposit.wallets.search")}
        aria-label={t("deposit.wallets.search")}
      />
      <SSourceScrollFrame>
        <ScrollArea height="100%">
          <SScrollAreaContent direction="column" gap="base">
            {onSelectProvider && (
              <WalletSourceButton
                title={t("deposit.wallets.all")}
                subtitle={t("deposit.wallets.connectedCount", {
                  count: wallets.connectedGroups.length,
                })}
                icon={WalletIcon}
                active={selectedProvider === null}
                onClick={() => onSelectProvider(null)}
              />
            )}
            <Flex direction="column" gap="s">
              {groups.length > 0 && (
                <WalletSourceCategoryLabel>
                  {t(
                    showConnectedOnly && hasConnectedWallets
                      ? "deposit.wallets.yourWallets"
                      : "deposit.wallets.installed",
                  )}
                </WalletSourceCategoryLabel>
              )}
              {groups.map((group) => {
                const status = statusForGroup(group.providers)
                const isConnected = group.providers.some((provider) =>
                  wallets.connectedProviders.has(provider),
                )
                const isSelected =
                  selectedProvider !== null &&
                  group.providers.includes(selectedProvider)
                const provider =
                  group.providers.find((provider) =>
                    wallets.connectedProviders.has(provider),
                  ) ?? group.providers[0]
                const choose = () => {
                  if (
                    isConnected &&
                    onSelectProvider &&
                    status !== "rejected" &&
                    status !== "skipped"
                  )
                    onSelectProvider(provider)
                  else if (!wallets.isConnecting)
                    wallets.connectProviders(group.providers)
                }
                const groupQueue = group.providers.filter((provider) =>
                  wallets.queue.includes(provider),
                )
                const completed = group.providers.filter((provider) =>
                  wallets.connectedProviders.has(provider),
                ).length
                const statusLabel = t(`deposit.wallets.status.${status}`)
                const label = groupQueue.length
                  ? t("deposit.wallets.groupProgress", {
                      completed,
                      total: groupQueue.length,
                      status: statusLabel,
                    })
                  : statusLabel
                return (
                  <WalletSourceButton
                    key={group.id}
                    title={group.title}
                    subtitle={label}
                    logo={group.logo}
                    active={isSelected}
                    connected={isConnected}
                    pending={status === "pending"}
                    chainModes={getWalletGroupSourceModes(group)}
                    action={
                      (status === "rejected" || status === "skipped") && (
                        <Text fs="p7" color={getToken("text.medium")}>
                          {t("deposit.wallets.retry")}
                        </Text>
                      )
                    }
                    onClick={choose}
                  />
                )
              })}
            </Flex>
            {wallets.connectableGroups.length > 0 && (
              <WalletSourceButton
                title={t("deposit.wallets.connectAll")}
                subtitle={wallets.connectableGroups
                  .map((group) => group.title)
                  .join(", ")}
                icon={LucideWallet}
                iconColor="neutral"
                pending={wallets.isConnecting}
                onClick={() => {
                  if (!wallets.isConnecting) wallets.connectAll()
                }}
              />
            )}
            {wallets.isConnecting && wallets.currentWallet && (
              <Flex direction="column" gap="s">
                <Text fs="p6" color={getToken("text.medium")}>
                  {t("deposit.wallets.overallProgress", {
                    current: Math.min(
                      wallets.completed + 1,
                      wallets.queue.length,
                    ),
                    total: wallets.queue.length,
                    wallet: wallets.currentWallet.title,
                  })}
                </Text>
                <Button
                  variant="muted"
                  size="small"
                  onClick={wallets.skipCurrent}
                >
                  {t("deposit.wallets.skip", {
                    wallet: wallets.currentWallet.title,
                  })}
                </Button>
              </Flex>
            )}
            <WalletSourceButton
              title={t("deposit.wallets.add")}
              icon={Plus}
              onClick={() => {
                wallets.refresh()
                setShowMore((open) => !open)
              }}
            />
            {showAvailableWallets && (
              <Stack gap="s">
                {otherWallets.map((wallet) => (
                  <WalletSourceButton
                    key={wallet.provider}
                    title={wallet.title}
                    logo={wallet.logo}
                    chainModes={getWalletSourceModes(wallet.provider)}
                    subtitle={getWalletSourceModeLabel(
                      getWalletPrimaryMode(wallet.provider),
                    )}
                    pending={wallets.currentProvider === wallet.provider}
                    onClick={() => {
                      if (!wallets.isConnecting)
                        wallets.connectWallet(wallet.provider)
                    }}
                  />
                ))}
                {!otherWallets.length && (
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("deposit.wallets.noOtherWallets")}
                  </Text>
                )}
              </Stack>
            )}
          </SScrollAreaContent>
        </ScrollArea>
      </SSourceScrollFrame>
    </SSourceColumn>
  )
}
