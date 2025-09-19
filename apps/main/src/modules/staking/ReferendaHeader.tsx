import { Chip, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

import { ReferendaSeparator } from "@/modules/staking/ReferendaSeparator"

type Props = {
  readonly title: string
  readonly tags: ReadonlyArray<string>
  readonly number: number
}

export const ReferendaHeader: FC<Props> = ({ title, tags, number }) => {
  return (
    <Flex direction="column" gap={16}>
      <Flex py={4} align="center" gap={4}>
        {tags.map((tag) => (
          <Chip key={tag}>{tag}</Chip>
        ))}
        <Text fs={14} lh={1.3} color={getToken("text.tint.primary")}>
          #{number}
        </Text>
      </Flex>
      <ReferendaSeparator />
      <Text
        py={4}
        fw={500}
        fs="p2"
        lh={1.3}
        color={getToken("surfaces.containers.low.onPrimary")}
      >
        {title}
      </Text>
    </Flex>
  )
}
