import { Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  Chip,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuContentDivider,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  MenuItemAction,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
} from "@galacticcouncil/ui/components"
import { useCopy } from "@galacticcouncil/utils"
import {
  useAccount,
  useAccountMultisigConfigs,
  useWeb3ConnectModal,
} from "@galacticcouncil/web3-connect"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeftRight,
  CheckIcon,
  ChevronDown,
  CopyIcon,
  LogOut,
  Users,
} from "lucide-react"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"

import { SCaretButton } from "./UserMenu.styled"

export const UserMenu: FC = () => {
  const { t } = useTranslation()
  const { account, disconnect } = useAccount()
  const { toggle } = useWeb3ConnectModal()
  const multisigConfigs = useAccountMultisigConfigs()
  const { copied, copy } = useCopy(2000)

  if (!account) return null

  const multisigCount = multisigConfigs.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SCaretButton variant="tertiary" aria-label={t("userMenu.openMenu")}>
          <Icon size="s" component={ChevronDown} />
        </SCaretButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <MenuSelectionItem asChild>
            <Link to="/wallet">
              <MenuItemIcon component={Wallet} />
              <MenuItemLabel>{t("userMenu.wallet")}</MenuItemLabel>
            </Link>
          </MenuSelectionItem>
        </DropdownMenuItem>

        {multisigCount > 0 && (
          <DropdownMenuItem asChild>
            <MenuSelectionItem asChild>
              <Link to={LINKS.multisigs}>
                <MenuItemIcon component={Users} />
                <MenuItemLabel>{t("userMenu.multisigs")}</MenuItemLabel>
                <MenuItemAction>
                  <Chip variant="green">{multisigCount}</Chip>
                </MenuItemAction>
              </Link>
            </MenuSelectionItem>
          </DropdownMenuItem>
        )}

        <DropdownMenuContentDivider />

        <DropdownMenuItem asChild>
          <MenuSelectionItem
            onClick={() => {
              toggle()
            }}
          >
            <MenuItemIcon component={ArrowLeftRight} />
            <MenuItemLabel>{t("userMenu.switchAccount")}</MenuItemLabel>
          </MenuSelectionItem>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <MenuSelectionItem
            onClick={(e) => {
              e.preventDefault()
              copy(account.displayAddress)
            }}
          >
            <MenuItemIcon component={copied ? CheckIcon : CopyIcon} />
            <MenuItemLabel>{t("userMenu.copyAddress")}</MenuItemLabel>
          </MenuSelectionItem>
        </DropdownMenuItem>

        <DropdownMenuContentDivider />

        <DropdownMenuItem asChild>
          <MenuSelectionItem
            onClick={() => {
              disconnect()
            }}
          >
            <MenuItemIcon component={LogOut} />
            <MenuItemLabel>{t("userMenu.disconnect")}</MenuItemLabel>
          </MenuSelectionItem>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
