import { Plus, WalletIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  ScrollArea,
  SearchInput,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { WalletProviderStatus } from "@galacticcouncil/web3-connect"
import {
  SScrollAreaContent,
  SSearchInput,
  SSourceColumn,
  SSourceScrollFrame,
} from "@galacticcouncil/web3-connect/src/components/content/WalletManagementContent.styled"
import {
  WalletSourceButton,
  WalletSourceCategoryLabel,
} from "@galacticcouncil/web3-connect/src/components/content/WalletManagementSource"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import {
  getWalletGroupSourceModes,
  getWalletPrimaryMode,
  getWalletSourceModeLabel,
  getWalletSourceModes,
} from "@galacticcouncil/web3-connect/src/utils/walletSource"
import { LucideWallet } from "lucide-react"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { useDepositWallets } from "@/modules/onramp/deposit/hooks/useDepositWallets"

export type DepositWalletListProps = {
  selectedProvider?: WalletProviderType | null
  onSelectProvider?: (provider: WalletProviderType | null) => void
  showConnectedOnly?: boolean
  compact?: boolean
}

export const DepositWalletList: FC<DepositWalletListProps> = ({
  selectedProvider = null,
  onSelectProvider,
  showConnectedOnly = false,
  compact = false,
}) => {
  const { t } = useTranslation("onramp")
  const [search, setSearch] = useState("")
  const [showMore, setShowMore] = useState(false)
  const wallets = useDepositWallets()
  const term = search.trim().toLowerCase()
  const groups = wallets.groups.filter(
    (group) =>
      group.title.toLowerCase().includes(term) &&
      (!showConnectedOnly ||
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

  const content = (
    <>
      {!compact && onSelectProvider && (
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
      <Flex
        direction={compact ? "row" : "column"}
        gap="s"
        overflow={compact ? "auto" : undefined}
      >
        {compact && onSelectProvider && (
          <Button
            variant={selectedProvider === null ? "secondary" : "muted"}
            size="small"
            flexShrink={0}
            onClick={() => onSelectProvider(null)}
          >
            {t("deposit.wallets.all")}
          </Button>
        )}
        {!compact && groups.length > 0 && (
          <WalletSourceCategoryLabel>
            {t(
              showConnectedOnly
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
          return compact ? (
            <Button
              key={group.id}
              variant={isSelected ? "secondary" : "muted"}
              size="small"
              flexShrink={0}
              onClick={choose}
              title={label}
            >
              <img
                src={group.logo}
                alt=""
                sx={{ size: "m", objectFit: "contain" }}
              />
              {group.title}
            </Button>
          ) : (
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
        {compact && (
          <Button
            variant="muted"
            size="small"
            flexShrink={0}
            onClick={() => {
              wallets.refresh()
              setShowMore((open) => !open)
            }}
          >
            <Plus sx={{ width: "m", height: "m" }} />
            {t("deposit.wallets.add")}
          </Button>
        )}
      </Flex>
      {!compact && wallets.connectableGroups.length > 0 && (
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
              current: Math.min(wallets.completed + 1, wallets.queue.length),
              total: wallets.queue.length,
              wallet: wallets.currentWallet.title,
            })}
          </Text>
          <Button variant="muted" size="small" onClick={wallets.skipCurrent}>
            {t("deposit.wallets.skip", { wallet: wallets.currentWallet.title })}
          </Button>
        </Flex>
      )}
      {!compact && (
        <WalletSourceButton
          title={t("deposit.wallets.add")}
          icon={Plus}
          onClick={() => {
            wallets.refresh()
            setShowMore((open) => !open)
          }}
        />
      )}
      {showMore && (
        <Stack gap="s">
          {compact && (
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("deposit.wallets.search")}
              aria-label={t("deposit.wallets.search")}
            />
          )}
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
    </>
  )

  if (compact)
    return (
      <Stack gap="m" minWidth={0} width="100%">
        {content}
      </Stack>
    )

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
            {content}
          </SScrollAreaContent>
        </ScrollArea>
      </SSourceScrollFrame>
    </SSourceColumn>
  )
}
