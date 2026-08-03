import { latestAccountBalanceQuery } from "@galacticcouncil/indexer/squid"
import { Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ButtonIcon,
  Chip,
  CopyButton,
  Flex,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Icon,
  MenuItemAction,
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  MicroButton,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import {
  formatCurrency,
  shortenAccountAddress,
  stringEquals,
} from "@galacticcouncil/utils"
import {
  useAccount,
  useWeb3Connect,
  useWeb3ConnectModal,
  WalletProviderStatus,
  Web3ConnectModalPage,
} from "@galacticcouncil/web3-connect"
import { ProviderLogo } from "@galacticcouncil/web3-connect/src/components/provider/ProviderLogo"
import {
  SUBSTRATE_H160_PROVIDERS,
  SUBSTRATE_PROVIDERS,
  WalletProviderType,
} from "@galacticcouncil/web3-connect/src/config/providers"
import {
  isEip1193Provider,
  requestAccounts,
} from "@galacticcouncil/web3-connect/src/utils"
import { getWallet, MetaMask } from "@galacticcouncil/web3-connect/src/wallets"
import { useQueries } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { LogOut, Plus, RefreshCw } from "lucide-react"
import { FC, ReactNode, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/react/shallow"

import { useSquidClient } from "@/api/provider"
import {
  getRecentProviderAccount,
  useRecentProviderAccountsStore,
} from "@/states/recentProviderAccounts"

import { SHoverActions } from "./UserMenu.styled"

const HOVER_BALANCE_STALE_TIME = 60_000

const useHoverWalletBalances = (
  accounts: ReturnType<typeof useAccount>["accounts"],
  enabled: boolean,
) => {
  const squidSdk = useSquidClient()
  const accountsWithoutCachedBalance = useMemo(() => {
    const byPublicKey = new Map<string, (typeof accounts)[number]>()

    for (const account of accounts) {
      if (account.balance !== undefined || byPublicKey.has(account.publicKey)) {
        continue
      }
      byPublicKey.set(account.publicKey, account)
    }

    return [...byPublicKey.values()]
  }, [accounts])

  const balanceQueries = useQueries({
    queries: accountsWithoutCachedBalance.map((account) => ({
      ...latestAccountBalanceQuery(squidSdk, account.publicKey),
      enabled,
      staleTime: HOVER_BALANCE_STALE_TIME,
      refetchOnWindowFocus: false,
    })),
  })

  return useMemo(() => {
    const balances = new Map<string, number>()

    for (const account of accounts) {
      if (account.balance !== undefined) {
        balances.set(account.publicKey, account.balance)
      }
    }

    accountsWithoutCachedBalance.forEach((account, index) => {
      const latest =
        balanceQueries[
          index
        ]?.data?.accountTotalBalanceHistoricalData?.nodes.at(0)
      if (!latest) return

      const transferable = Number(latest.totalTransferableNorm) || 0
      const locked = Number(latest.totalLockedNorm) || 0
      balances.set(account.publicKey, transferable + locked)
    })

    return {
      balances,
      isLoading: enabled && balanceQueries.some((query) => query.isLoading),
    }
  }, [accounts, accountsWithoutCachedBalance, balanceQueries, enabled])
}

const UserMenuSeparator = () => (
  <Separator
    sx={{
      my: "base",
      mx: -12,
    }}
  />
)

const MANAGE_ACCOUNT_PROVIDERS: WalletProviderType[] = [
  ...SUBSTRATE_PROVIDERS,
  ...SUBSTRATE_H160_PROVIDERS,
].filter((provider) => provider !== WalletProviderType.WalletConnect)

type Props = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onHoverStart: () => void
  readonly onHoverEnd: () => void
  readonly anchor: ReactNode
}

export const UserMenu: FC<Props> = ({
  open,
  onOpenChange,
  onHoverStart,
  onHoverEnd,
  anchor,
}) => {
  const { t } = useTranslation()
  const { account, accounts } = useAccount()
  const { toggle } = useWeb3ConnectModal()
  const { providers, storedAccounts, setAccount, disconnect } = useWeb3Connect(
    useShallow((s) => ({
      providers: s.providers,
      storedAccounts: s.accounts,
      setAccount: s.setAccount,
      disconnect: s.disconnect,
    })),
  )
  const recentByProvider = useRecentProviderAccountsStore(
    (s) => s.recentByProvider,
  )

  const { balances: balancesByAccount, isLoading: areBalancesLoading } =
    useHoverWalletBalances(accounts, open)

  if (!account) return null

  const connectedTypes = providers
    .filter((p) => p.status === WalletProviderStatus.Connected)
    .map((p) => p.type)

  const openManageWallets = (initialProvider?: WalletProviderType) => {
    onOpenChange(false)
    toggle(undefined, {
      initialPage: Web3ConnectModalPage.AccountSelect,
      initialProvider,
    })
  }

  return (
    <HoverCard open={open} onOpenChange={onOpenChange} closeDelay={180}>
      <HoverCardTrigger asChild>{anchor}</HoverCardTrigger>
      <HoverCardContent
        align="end"
        p={12}
        sideOffset={8}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        sx={{
          minWidth: pxToRem(360),
          maxHeight: "var(--radix-hover-card-content-available-height)",
          overflowY: "auto",
        }}
      >
        <Flex align="center" justify="space-between" gap="s" py="base" px="m">
          <Flex align="center" gap="base">
            <Icon size="l" component={Wallet} color={getToken("text.medium")} />
            <Text fw={600} fs="p3">
              {t("userMenu.connectedWallets")}
            </Text>
          </Flex>
          <MicroButton sx={{ py: "s" }} asChild>
            <Link to="/wallet" onClick={() => onOpenChange(false)}>
              {t("userMenu.goToWallet")}
            </Link>
          </MicroButton>
        </Flex>

        <UserMenuSeparator />

        {connectedTypes.map((type) => {
          const wallet = getWallet(type)
          const providerAccounts = accounts.filter((a) => a.provider === type)
          const recentAccount = getRecentProviderAccount(
            type,
            providerAccounts,
            recentByProvider,
          )
          if (!wallet || !recentAccount) return null

          const isActiveProvider = type === account.provider
          const address = isActiveProvider
            ? account.displayAddress
            : recentAccount.displayAddress

          const storedRecentAccount = storedAccounts.find(
            (a) =>
              a.provider === type && a.publicKey === recentAccount.publicKey,
          )

          const accountName = isActiveProvider
            ? account.name
            : recentAccount.name
          const shortAddress = shortenAccountAddress(address)
          const isExternalWallet = type === WalletProviderType.ExternalWallet
          const hasDistinctName =
            accountName && !stringEquals(accountName, shortAddress)
          const copyLabel = t("userMenu.copyAddress")
          const changeAccountLabel = t("userMenu.changeAccount")
          const disconnectLabel = t("userMenu.disconnect", {
            provider: wallet.title,
          })
          const metaMaskExtension =
            wallet instanceof MetaMask && isEip1193Provider(wallet.extension)
              ? wallet.extension
              : undefined
          const canManageProviderAccounts =
            MANAGE_ACCOUNT_PROVIDERS.includes(type) &&
            providerAccounts.length > 1
          const providerBalance = providerAccounts.reduce<number | null>(
            (total, providerAccount) => {
              const balance = balancesByAccount.get(providerAccount.publicKey)
              return total === null || balance === undefined
                ? null
                : total + balance
            },
            0,
          )
          const accountSummary =
            providerBalance !== null
              ? t("userMenu.accountsBalance", {
                  count: providerAccounts.length,
                  balance: formatCurrency(providerBalance),
                })
              : areBalancesLoading
                ? t("userMenu.accountsBalanceLoading", {
                    count: providerAccounts.length,
                  })
                : t("userMenu.accountsCount", {
                    count: providerAccounts.length,
                  })
          const shouldShowAccountSummary =
            !isExternalWallet &&
            (providerAccounts.length > 1 ||
              providerBalance !== null ||
              areBalancesLoading)

          return (
            <MenuSelectionItem
              key={type}
              onClick={
                isActiveProvider
                  ? () => openManageWallets(type)
                  : storedRecentAccount
                    ? () => setAccount(storedRecentAccount)
                    : undefined
              }
            >
              <Box sx={{ gridRow: "1 / -1", flexShrink: 0 }}>
                <ProviderLogo size="xl" wallet={wallet} />
              </Box>
              <MenuItemLabel>
                <Flex align="center" gap="s" minWidth={0}>
                  {hasDistinctName ? (
                    <Text truncate={pxToRem(140)}>{accountName}</Text>
                  ) : (
                    shortAddress
                  )}
                  {isActiveProvider && (
                    <Chip size="small" rounded variant="green">
                      {t("userMenu.active")}
                    </Chip>
                  )}
                </Flex>
              </MenuItemLabel>
              {(isExternalWallet || shouldShowAccountSummary) && (
                <MenuItemDescription>
                  {isExternalWallet ? shortAddress : accountSummary}
                </MenuItemDescription>
              )}
              <MenuItemAction>
                <Flex align="center" gap="s">
                  <SHoverActions align="center">
                    {metaMaskExtension && (
                      <ButtonIcon
                        title={changeAccountLabel}
                        aria-label={changeAccountLabel}
                        onClick={(e) => {
                          e.stopPropagation()
                          requestAccounts(metaMaskExtension)
                        }}
                      >
                        <Icon size="s" component={RefreshCw} />
                      </ButtonIcon>
                    )}
                    {canManageProviderAccounts && (
                      <ButtonIcon
                        title={changeAccountLabel}
                        aria-label={changeAccountLabel}
                        onClick={(e) => {
                          e.stopPropagation()
                          openManageWallets(type)
                        }}
                      >
                        <Icon size="s" component={RefreshCw} />
                      </ButtonIcon>
                    )}
                    {isExternalWallet && (
                      <ButtonIcon
                        title={changeAccountLabel}
                        aria-label={changeAccountLabel}
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenChange(false)
                          toggle(undefined, {
                            initialPage: Web3ConnectModalPage.ExternalWallet,
                          })
                        }}
                      >
                        <Icon size="s" component={RefreshCw} />
                      </ButtonIcon>
                    )}
                    <ButtonIcon asChild>
                      <CopyButton
                        text={address}
                        title={copyLabel}
                        aria-label={copyLabel}
                      />
                    </ButtonIcon>
                    <ButtonIcon
                      title={disconnectLabel}
                      aria-label={disconnectLabel}
                      onClick={(e) => {
                        e.stopPropagation()
                        disconnect(type)
                      }}
                    >
                      <Icon size="s" component={LogOut} />
                    </ButtonIcon>
                  </SHoverActions>
                </Flex>
              </MenuItemAction>
            </MenuSelectionItem>
          )
        })}

        <MenuSelectionItem
          onClick={() => {
            disconnect()
            onOpenChange(false)
          }}
        >
          <MenuItemIcon sx={{ width: "xl", height: "xl" }} component={LogOut} />
          <MenuItemLabel>{t("userMenu.logOutAll")}</MenuItemLabel>
        </MenuSelectionItem>

        <UserMenuSeparator />

        <MenuSelectionItem
          onClick={() => {
            openManageWallets()
          }}
        >
          <MenuItemIcon sx={{ width: "xl", height: "xl" }} component={Plus} />
          <MenuItemLabel>{t("userMenu.manageWallets")}</MenuItemLabel>
        </MenuSelectionItem>
      </HoverCardContent>
    </HoverCard>
  )
}
