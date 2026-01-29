import {
  BinaryIcon,
  BracesIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
} from "@galacticcouncil/ui/assets/icons"
import {
  CopyButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  ExternalLink,
  Icon,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
} from "@galacticcouncil/ui/components"
import { safeStringify } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"
import { isObjectType } from "remeda"

import { CopyMenuTrigger } from "./CopyMenu.styled"

export type CopyMenuProps = {
  txUrl?: string
  txCallHash?: string
  txJson?: object
}

export const CopyMenu: React.FC<CopyMenuProps> = ({
  txUrl,
  txCallHash,
  txJson,
}) => {
  const { t } = useTranslation("common")

  if (!txJson && !txCallHash && !txUrl) {
    return null
  }

  return (
    <DropdownMenu>
      <CopyMenuTrigger>
        <Icon size="s" component={CopyIcon} />
        {t("transaction.jsonview.copy.title")}
      </CopyMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={0}>
        {isObjectType(txJson) && (
          <DropdownMenuItem asChild>
            <MenuSelectionItem asChild variant="filterLink">
              <CopyButton text={safeStringify(txJson, true)}>
                {({ copied }) => (
                  <>
                    <MenuItemIcon
                      size="m"
                      component={copied ? CheckIcon : BracesIcon}
                    />
                    <MenuItemLabel>
                      {t("transaction.jsonview.copy.json")}
                    </MenuItemLabel>
                  </>
                )}
              </CopyButton>
            </MenuSelectionItem>
          </DropdownMenuItem>
        )}
        {txCallHash && (
          <DropdownMenuItem asChild>
            <MenuSelectionItem asChild variant="filterLink">
              <CopyButton text={txCallHash}>
                {({ copied }) => (
                  <>
                    <MenuItemIcon
                      size="m"
                      component={copied ? CheckIcon : BinaryIcon}
                    />
                    <MenuItemLabel>
                      {t("transaction.jsonview.copy.calldata")}
                    </MenuItemLabel>
                  </>
                )}
              </CopyButton>
            </MenuSelectionItem>
          </DropdownMenuItem>
        )}
        {txUrl && (
          <DropdownMenuItem asChild>
            <MenuSelectionItem asChild variant="filterLink">
              <ExternalLink href={txUrl}>
                <MenuItemIcon size="m" component={ExternalLinkIcon} />
                <MenuItemLabel>{t("transaction.sign.openInPjs")}</MenuItemLabel>
              </ExternalLink>
            </MenuSelectionItem>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
