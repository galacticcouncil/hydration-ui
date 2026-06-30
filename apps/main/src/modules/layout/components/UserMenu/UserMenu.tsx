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
import { shortenAccountAddress, stringEquals } from "@galacticcouncil/utils"
import {
  useAccount,
  useWeb3Connect,
  useWeb3ConnectModal,
  WalletProviderStatus,
} from "@galacticcouncil/web3-connect"
import { ProviderLogo } from "@galacticcouncil/web3-connect/src/components/provider/ProviderLogo"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { Link } from "@tanstack/react-router"
import { LogOut, Plus } from "lucide-react"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/react/shallow"

import {
  getRecentProviderAccount,
  useRecentProviderAccountsStore,
} from "@/states/recentProviderAccounts"

import { SHoverActions } from "./UserMenu.styled"

const UserMenuSeparator = () => (
  <Separator
    sx={{
      my: "base",
      mx: -12,
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
          const hasDistinctName =
            accountName && !stringEquals(accountName, shortAddress)
          const copyLabel = t("userMenu.copyAddress")
          const disconnectLabel = t("userMenu.disconnect", {
            provider: wallet.title,
          })

          return (
            <MenuSelectionItem
              key={type}
              onClick={
                isActiveProvider || !storedRecentAccount
                  ? undefined
                  : () => setAccount(storedRecentAccount)
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
              {providerAccounts.length > 1 && (
                <MenuItemDescription>
                  {t("userMenu.accountsCount", {
                    count: providerAccounts.length,
                  })}
                </MenuItemDescription>
              )}
              <MenuItemAction>
                <Flex align="center" gap="s">
                  <SHoverActions align="center">
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

        <MenuSelectionItem
          onClick={() => {
            onOpenChange(false)
            toggle()
          }}
        >
          <MenuItemIcon sx={{ width: "xl", height: "xl" }} component={Plus} />
          <MenuItemLabel>{t("userMenu.manageWallets")}</MenuItemLabel>
        </MenuSelectionItem>
      </HoverCardContent>
    </HoverCard>
  )
}
