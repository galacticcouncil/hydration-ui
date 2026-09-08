import { Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { FC } from "react"

type Props = {
  readonly label: string
  readonly helpTooltip?: string
}

export const SettingLabel: FC<Props> = ({ label, helpTooltip }) => {
  return (
    <Flex gap="xs" align="center">
      <Text fw={600} fs="p4" lh={1.2}>
        {label}
      </Text>
      {helpTooltip && <Tooltip text={helpTooltip} />}
    </Flex>
  )
}
