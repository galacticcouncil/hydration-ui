import { Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ButtonIcon,
  Chip,
  CopyButton,
  Flex,
  Icon,
  MenuItemAction,
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  MicroButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress, stringEquals } from "@galacticcouncil/utils"
import {
  useAccount,
  useAccountMultisigConfigs,
  useWeb3Connect,
  useWeb3ConnectModal,
  WalletProviderStatus,
} from "@galacticcouncil/web3-connect"
import { ProviderLogo } from "@galacticcouncil/web3-connect/src/components/provider/ProviderLogo"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { Link } from "@tanstack/react-router"
import { ChevronDown, LogOut, Plus, Users } from "lucide-react"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/react/shallow"

import { LINKS } from "@/config/navigation"
import {
  getRecentProviderAccount,
  useRecentProviderAccountsStore,
} from "@/states/recentProviderAccounts"

import { SCaretButton, SHoverActions } from "./UserMenu.styled"

const UserMenuSeparator = () => (
  <Separator
    sx={{
      my: "base",
      mx: "calc(var(--popover-content-horizontal-padding) * -1)",
    }}
  />
)

export const UserMenu: FC = () => {
  const { t } = useTranslation()
  const { account, accounts } = useAccount()
  const { toggle } = useWeb3ConnectModal()
  const multisigConfigs = useAccountMultisigConfigs()
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
  const [open, setOpen] = useState(false)

  if (!account) return null

  const multisigCount = multisigConfigs.length

  const connectedTypes = providers
    .filter((p) => p.status === WalletProviderStatus.Connected)
    .map((p) => p.type)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SCaretButton variant="tertiary" aria-label={t("userMenu.openMenu")}>
          <Icon size="s" component={ChevronDown} />
        </SCaretButton>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sx={{
          minWidth: ["100%", "5xl"],
          maxHeight: "var(--radix-popover-content-available-height)",
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
            <Link to="/wallet" onClick={() => setOpen(false)}>
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
                  {/* {isActiveProvider && (
                    <Button
                      size="small"
                      variant="tertiary"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpen(false)
                        toggle()
                      }}
                    >
                      {t("userMenu.changeAccount")}
                    </Button>
                  )} */}
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

        {multisigCount > 0 && (
          <MenuSelectionItem asChild>
            <Link to={LINKS.multisigs} onClick={() => setOpen(false)}>
              <MenuItemIcon
                sx={{ width: "xl", height: "xl" }}
                component={Users}
              />
              <MenuItemLabel>{t("userMenu.multisigs")}</MenuItemLabel>
              <MenuItemAction>
                <Chip variant="green">{multisigCount}</Chip>
              </MenuItemAction>
            </Link>
          </MenuSelectionItem>
        )}

        <UserMenuSeparator />

        <MenuSelectionItem
          onClick={() => {
            setOpen(false)
            toggle()
          }}
        >
          <MenuItemIcon sx={{ width: "xl", height: "xl" }} component={Plus} />
          <MenuItemLabel>{t("userMenu.manageWallets")}</MenuItemLabel>
        </MenuSelectionItem>
      </PopoverContent>
    </Popover>
  )
}
