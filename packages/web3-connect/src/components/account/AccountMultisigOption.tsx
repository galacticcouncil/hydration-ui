import { Users } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { SAccountOption } from "@/components/account/AccountOption.styled"
import { MultisigConfig } from "@/hooks/useMultisigStore"

type Props = {
  config: MultisigConfig
  isActive?: boolean
  onSelect: (config: MultisigConfig) => void
}

export const AccountMultisigOption: React.FC<Props> = ({
  config,
  isActive,
  onSelect,
}) => {
  return (
    <SAccountOption data-active={isActive} onClick={() => onSelect(config)}>
      <Flex align="center" gap="m">
        <Icon
          size="m"
          component={Users}
          color={getToken("text.high")}
          sx={{ flexShrink: 0 }}
        />
        <Flex direction="column" sx={{ minWidth: 0 }}>
          <Flex align="center" gap="s">
            <Text fs="p3" truncate={200}>
              {config.name ||
                `Multisig ${config.threshold}/${config.signers.length}`}
            </Text>
            <Text fs="p6" color={getToken("text.medium")}>
              {config.threshold}/{config.signers.length}
            </Text>
          </Flex>
          <Text fs="p4" color={getToken("text.medium")} truncate={200}>
            {config.address}
          </Text>
        </Flex>
      </Flex>
    </SAccountOption>
  )
}
