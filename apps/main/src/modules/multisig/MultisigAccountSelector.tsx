import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  Box,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Icon,
  MenuItemDescription,
  MenuItemLabel,
  MenuSelectionItem,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  safeConvertAddressSS58,
  shortenAccountAddress,
} from "@galacticcouncil/utils"
import {
  MultisigConfig,
  useAccountMultisigConfigs,
} from "@galacticcouncil/web3-connect"
import { CheckIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

type Props = {
  config: MultisigConfig
  onSelectMultisig: (config: MultisigConfig) => void
}

const getMultisigName = (
  multisigConfig: MultisigConfig,
  noNameLabel: string,
) =>
  multisigConfig.name.trim().length > 0
    ? multisigConfig.name.trim()
    : noNameLabel

export const MultisigAccountSelector: React.FC<Props> = ({
  config,
  onSelectMultisig,
}) => {
  const { t } = useTranslation()
  const multisigConfigs = useAccountMultisigConfigs()
  const normalizedAddress = safeConvertAddressSS58(config.address)
  const noNameLabel = t("multisig.detail.noName")

  const selectMultisig = (multisigConfig: MultisigConfig) => {
    if (safeConvertAddressSS58(multisigConfig.address) === normalizedAddress) {
      return
    }

    onSelectMultisig(multisigConfig)
  }

  if (multisigConfigs.length <= 1) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="transparent" outline>
          <Flex align="center" gap="s">
            {t("multisig.detail.accounts", {
              count: multisigConfigs.length,
            })}
            <Icon
              size="s"
              component={ChevronDown}
              sx={{ flexShrink: 0, mr: "-s" }}
            />
          </Flex>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {multisigConfigs.map((multisigConfig) => {
          const isActive =
            safeConvertAddressSS58(multisigConfig.address) === normalizedAddress

          return (
            <DropdownMenuItem
              key={multisigConfig.id}
              asChild
              onSelect={() => selectMultisig(multisigConfig)}
            >
              <MenuSelectionItem>
                <Box sx={{ gridRow: "1 / -1" }}>
                  <AccountAvatar address={multisigConfig.address} size={32} />
                </Box>
                <MenuItemLabel>
                  {getMultisigName(multisigConfig, noNameLabel)}
                </MenuItemLabel>
                <MenuItemDescription>
                  {shortenAccountAddress(multisigConfig.address, 6)}
                </MenuItemDescription>
                {isActive && (
                  <Icon
                    size="m"
                    component={CheckIcon}
                    ml="l"
                    sx={{
                      gridRow: "1 / -1",
                      color: getToken("text.tint.secondary"),
                    }}
                  />
                )}
              </MenuSelectionItem>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
