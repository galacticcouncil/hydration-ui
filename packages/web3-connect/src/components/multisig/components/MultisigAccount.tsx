import {
  AccountAvatar,
  BoxProps,
  ButtonIcon,
  Chip,
  CopyButton,
  Flex,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { SMultisigAccount } from "@/components/multisig/components/MultisigAccount.styled"
import { MultisigConfig } from "@/hooks/useMultisigStore"

export type MultisigAccountProps = BoxProps & {
  isActive?: boolean
  config: Omit<MultisigConfig, "id" | "isCustom">
}

export const MultisigAccount: React.FC<MultisigAccountProps> = ({
  isActive,
  config,
  ...props
}) => {
  const { t } = useTranslation()
  const { address, name, threshold, signers } = config
  return (
    <SMultisigAccount data-active={isActive} {...props}>
      <AccountAvatar address={address} />
      <Stack sx={{ minWidth: 0 }}>
        <Flex gap="s" align="center">
          <Text fs="p3" fw={500} lh={1.5} truncate>
            {name}
          </Text>
          <Chip variant="green" size="small">
            {t("multisig.setup.thresholdLabel")} {threshold}/{signers.length}
          </Chip>
        </Flex>
        <Text fs="p5" fw={500} color={getToken("text.medium")} truncate>
          {address}
        </Text>
      </Stack>
      <Flex align="center" p="s" ml="auto">
        <ButtonIcon asChild>
          <CopyButton text={address} />
        </ButtonIcon>
      </Flex>
    </SMultisigAccount>
  )
}
