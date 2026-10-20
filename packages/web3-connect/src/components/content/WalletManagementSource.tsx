import { Box, Flex, Icon, Spinner, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ChevronRight, LogOut } from "lucide-react"
import { ComponentType, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import {
  SConnectedDot,
  SourceIconColor,
  SSourceAction,
  SSourceButton,
  SSourceCategoryLabel,
  SSourceChainBadge,
  SSourceIcon,
  SSourceLogo,
  SStackedSourceLogo,
} from "@/components/content/WalletManagementSource.styled"
import { RoundLogo } from "@/components/RoundLogo"
import { WalletProviderType } from "@/config/providers"
import { getWalletModeIcon, WalletMode } from "@/config/wallet"
import { WalletProviderStatus } from "@/hooks/useWeb3Connect"
import { Wallet } from "@/types/wallet"
import {
  getWalletGroupSourceModes,
  getWalletSourceModes,
  WalletSourceGroup as WalletSourceGroupOf,
} from "@/utils/walletSource"
import { getWallet } from "@/wallets"

export type WalletSourceButtonVariant =
  | "management"
  | "firstConnection"
  | "firstConnectionPlain"

export type WalletSourceGroup = WalletSourceGroupOf<Wallet>

type WalletSourceChainBadge = {
  id: string
  icon?: ComponentType
  iconSrc?: string
}

const getWalletSourceChainBadges = (
  modes: WalletMode[],
): WalletSourceChainBadge[] =>
  modes.flatMap((mode) => {
    const modeIcon = getWalletModeIcon(mode)
    const badges: WalletSourceChainBadge[] = []

    if (modeIcon) {
      badges.push({
        id: mode,
        iconSrc: modeIcon,
      })
    }

    return badges
  })

export const WalletSourceCategoryLabel: React.FC<{
  readonly children: ReactNode
}> = ({ children }) => (
  <SSourceCategoryLabel fs="p5" fw={500} lh={1.25} color={getToken("text.low")}>
    {children}
  </SSourceCategoryLabel>
)

export const WalletSourceAction: React.FC<{
  readonly icon: ComponentType
  readonly label?: string
  readonly onClick?: () => void
}> = ({ icon, label, onClick }) => (
  <SSourceAction
    as="span"
    aria-label={label}
    onClick={
      onClick &&
      ((event) => {
        event.stopPropagation()
        onClick()
      })
    }
  >
    <Icon size="xs" component={icon} />
  </SSourceAction>
)

export const WalletSourceDisconnectAction: React.FC<{
  readonly onDisconnect: () => void
}> = ({ onDisconnect }) => {
  const { t } = useTranslation()

  return (
    <WalletSourceAction
      icon={LogOut}
      label={t("provider.disconnect")}
      onClick={onDisconnect}
    />
  )
}

export const WalletSourceButton: React.FC<{
  readonly active?: boolean
  readonly title: string
  readonly subtitle?: string
  readonly logo?: string
  readonly logos?: WalletProviderType[]
  readonly icon?: ComponentType
  readonly iconColor?: SourceIconColor
  readonly pending?: boolean
  readonly connected?: boolean
  readonly variant?: WalletSourceButtonVariant
  readonly chainModes?: WalletMode[]
  readonly action?: ReactNode
  readonly onClick: () => void
}> = ({
  active,
  title,
  subtitle,
  logo,
  logos,
  icon,
  iconColor,
  pending,
  connected,
  variant = "management",
  chainModes,
  action,
  onClick,
}) => (
  <SSourceButton
    type="button"
    data-active={active}
    data-variant={variant}
    onClick={onClick}
  >
    <Flex align="center" gap="base" minWidth={0} flex={1}>
      {(logo || icon || logos?.length) && (
        <Box position="relative" flexShrink={0}>
          {logo ? (
            <SSourceLogo src={logo} alt="" lazy={false} />
          ) : icon ? (
            <SSourceIcon iconColor={iconColor}>
              <Icon size="xs" component={icon} />
            </SSourceIcon>
          ) : (
            <Flex flexShrink={0}>
              {logos?.slice(0, 3).map((provider) => {
                const wallet = getWallet(provider)
                if (!wallet) return null
                return (
                  <SStackedSourceLogo
                    key={provider}
                    src={wallet.logo}
                    size="s"
                  />
                )
              })}
            </Flex>
          )}
          {connected && <SConnectedDot />}
        </Box>
      )}
      <Flex direction="column" minWidth={0}>
        <Text fs="p5" fw={500} color={getToken("text.high")} truncate>
          {title}
        </Text>
        {subtitle && (
          <Text
            fs="p7"
            fw={500}
            lh={1.2}
            color={getToken("text.medium")}
            truncate
          >
            {subtitle}
          </Text>
        )}
      </Flex>
    </Flex>
    {pending ? (
      <Spinner size="xs" />
    ) : variant === "firstConnectionPlain" ? null : (
      <Flex align="center" gap="xs" flexShrink={0}>
        {chainModes && chainModes.length > 0 && (
          <WalletSourceChainBadges modes={chainModes} />
        )}
        {action || <WalletSourceAction icon={ChevronRight} />}
      </Flex>
    )}
  </SSourceButton>
)

export const WalletSourceChainBadges: React.FC<{
  readonly modes: WalletMode[]
}> = ({ modes }) => {
  const badges = getWalletSourceChainBadges(modes)

  return (
    <Flex align="center" flexShrink={0}>
      {badges.slice(0, 4).map((badge) => (
        <SSourceChainBadge key={badge.id}>
          {badge.icon ? (
            <Icon component={badge.icon} />
          ) : badge.iconSrc ? (
            <RoundLogo src={badge.iconSrc} size="xs" />
          ) : null}
        </SSourceChainBadge>
      ))}
    </Flex>
  )
}

export const WalletProviderSourceButton: React.FC<{
  readonly wallet?: Wallet
  readonly active: boolean
  readonly status: WalletProviderStatus
  readonly pending: boolean
  readonly variant?: WalletSourceButtonVariant
  readonly connectLabel?: string
  readonly icon?: ComponentType
  readonly iconColor?: SourceIconColor
  readonly onClick: () => void
  readonly onDisconnect: () => void
}> = ({
  wallet,
  active,
  status,
  pending,
  variant = "management",
  connectLabel,
  icon,
  iconColor,
  onClick,
  onDisconnect,
}) => {
  const { t } = useTranslation()

  if (!wallet) return null

  const isConnected = status === WalletProviderStatus.Connected
  const chainModes = getWalletSourceModes(wallet.provider)
  const subtitle = isConnected
    ? t("provider.connected")
    : wallet.installed || connectLabel
      ? (connectLabel ?? t("provider.connect"))
      : t("provider.notInstalled")

  return (
    <WalletSourceButton
      active={active}
      title={wallet.title}
      subtitle={subtitle}
      connected={isConnected}
      logo={icon ? undefined : wallet.logo}
      icon={icon}
      iconColor={iconColor}
      pending={pending}
      variant={variant}
      chainModes={chainModes}
      onClick={onClick}
      action={
        isConnected && (
          <WalletSourceDisconnectAction onDisconnect={onDisconnect} />
        )
      }
    />
  )
}

export const WalletGroupSourceButton: React.FC<{
  readonly group: WalletSourceGroup
  readonly active: boolean
  readonly connected: boolean
  readonly pending: boolean
  readonly variant?: WalletSourceButtonVariant
  readonly connectLabel?: string
  readonly onClick: () => void
  readonly onDisconnect: () => void
}> = ({
  group,
  active,
  connected,
  pending,
  variant = "management",
  connectLabel,
  onClick,
  onDisconnect,
}) => {
  const { t } = useTranslation()
  const chainModes = getWalletGroupSourceModes(group)
  const isInstalled = group.wallets.some((wallet) => wallet.installed)
  const subtitle = connected
    ? t("provider.connected")
    : isInstalled || connectLabel
      ? (connectLabel ?? t("provider.connect"))
      : t("provider.notInstalled")

  return (
    <WalletSourceButton
      active={active}
      title={group.title}
      subtitle={subtitle}
      connected={connected}
      logo={group.logo}
      pending={pending}
      variant={variant}
      chainModes={chainModes}
      onClick={onClick}
      action={
        connected && (
          <WalletSourceDisconnectAction onDisconnect={onDisconnect} />
        )
      }
    />
  )
}
