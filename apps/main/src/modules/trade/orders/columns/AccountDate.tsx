import { Flex, FlexProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { FC } from "react"

import { DateText } from "@/components/RelativeDateText"

type Props = {
  readonly address: string | null
  readonly date: Date | null
  readonly align: FlexProps["align"]
}

export const AccountDate: FC<Props> = ({ address, date, align }) => {
  return (
    <Flex direction="column" gap="xs" align={align}>
      <Text fw={500} fs="p6" lh="xs" color={getToken("text.high")}>
        {shortenAccountAddress(address ?? "")}
      </Text>
      {date && (
        <DateText
          date={date}
          fw={500}
          fs="p6"
          lh="xs"
          color={getToken("text.medium")}
        />
      )}
    </Flex>
  )
}
