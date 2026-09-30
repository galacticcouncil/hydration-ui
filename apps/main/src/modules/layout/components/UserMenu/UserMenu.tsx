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
import { shortenAccountAddress, stringEquals } from "@galacticcouncil/utils"
import {
  AccountWalletAvatar,
  useAccount,
  useWeb3Connect,
  useWeb3ConnectModal,
  WalletProviderStatus,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { Link } from "@tanstack/react-router"
import { LogOut, Plus, WalletIcon } from "lucide-react"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/react/shallow"

import {
  getRecentProviderAccount,
  useRecentProviderAccountsStore,
} from "@/states/recentProviderAccounts"

import { SHoverActions } from "./UserMenu.styled"
import { UserMenuChangeAccountButton } from "./UserMenuChangeAccountButton"

const UserMenuSeparator = () => (
  <Separator
    sx={{
      my: "base",
      mx: "-base",
    }}
  />
)

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

  if (!account) return null

  const connectedTypes = providers
    .filter((p) => p.status === WalletProviderStatus.Connected)
    .map((p) => p.type)

  const openManageWallets = (initialProvider?: WalletProviderType) => {
    onOpenChange(false)
    toggle(undefined, { initialProvider })
  }

  return (
    <HoverCard open={open} onOpenChange={onOpenChange} closeDelay={180}>
      <HoverCardTrigger asChild>{anchor}</HoverCardTrigger>
      <HoverCardContent
        align="end"
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
            <Icon
              size="l"
              component={WalletIcon}
              color={getToken("text.medium")}
            />
            <Text fw={600} fs="p3">
              {t("userMenu.connectedWallets")}
            </Text>
          </Flex>
          <MicroButton py="s" asChild>
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
          const disconnectLabel = t("userMenu.disconnect", {
            provider: wallet.title,
          })
          const walletSummary = t("userMenu.walletAccounts", {
            wallet: wallet.title,
            count: providerAccounts.length,
          })

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
                <AccountWalletAvatar
                  address={address}
                  provider={type}
                  size={36}
                  badgeSize={16}
                />
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
              <MenuItemDescription>
                {isExternalWallet ? shortAddress : walletSummary}
              </MenuItemDescription>
              <MenuItemAction>
                <Flex align="center" gap="s">
                  <SHoverActions align="center">
                    <UserMenuChangeAccountButton
                      wallet={wallet}
                      provider={type}
                      accountCount={providerAccounts.length}
                      onCloseMenu={() => onOpenChange(false)}
                    />
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

        <UserMenuSeparator />

        <MenuSelectionItem onClick={() => openManageWallets()}>
          <MenuItemIcon sx={{ width: "xl", height: "xl" }} component={Plus} />
          <MenuItemLabel>{t("userMenu.manageWallets")}</MenuItemLabel>
        </MenuSelectionItem>

        <MenuSelectionItem
          onClick={() => {
            disconnect()
            onOpenChange(false)
          }}
        >
          <MenuItemIcon sx={{ width: "xl", height: "xl" }} component={LogOut} />
          <MenuItemLabel>{t("userMenu.logOutAll")}</MenuItemLabel>
        </MenuSelectionItem>
      </HoverCardContent>
    </HoverCard>
  )
}
