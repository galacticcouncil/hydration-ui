import { Flex } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

import { ReferendaFooter } from "@/modules/staking/ReferendaFooter"
import { ReferendaHeader } from "@/modules/staking/ReferendaHeader"
import { ReferendaSeparator } from "@/modules/staking/ReferendaSeparator"
import { ReferendaStatus } from "@/modules/staking/ReferendaStatus"

export type Referenda = {
  readonly id: string
  readonly title: string
  readonly tags: ReadonlyArray<string>
  readonly number: number
  readonly percent: number
  readonly ayeValue: string
  readonly ayePercent: number
  readonly thresholdValue: string
  readonly thresholdPercent: number
  readonly nayValue: string
  readonly nayPercent: number
  readonly end: Date
}

type Props = {
  readonly item: Referenda
}

export const Referenda: FC<Props> = ({ item }) => {
  return (
    <Flex
      px={16}
      py={20}
      borderRadius={16}
      bg={getToken("surfaces.containers.low.primary")}
      borderWidth={1}
      borderStyle="solid"
      borderColor={getToken("surfaces.containers.low.border")}
      direction="column"
      gap={11}
    >
      <ReferendaHeader
        title={item.title}
        tags={item.tags}
        number={item.number}
      />
      <ReferendaStatus
        percent={item.percent}
        ayeValue={item.ayeValue}
        ayePercent={item.ayePercent}
        thresholdValue={item.thresholdValue}
        thresholdPercent={item.thresholdPercent}
        nayValue={item.nayValue}
        nayPercent={item.nayPercent}
      />
      <ReferendaSeparator />
      <ReferendaFooter end={item.end} />
    </Flex>
  )
}
