import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"

import { SDepositType } from "@/modules/wallet/assets/Deposit/DepositType.styled"

type Props = {
  readonly title: string
  readonly description: string
  readonly onClick: () => void
}

export const DepositType: FC<Props> = ({ title, description, onClick }) => {
  return (
    <SDepositType onClick={onClick}>
      <Flex direction="column" gap={4}>
        <Text fw={600} fs={16} lh={px(18)} color={getToken("text.high")}>
          {title}
        </Text>
        <Text fs={13} lh={px(15)} color={getToken("text.low")}>
          {description}
        </Text>
      </Flex>
      <Icon
        component={ArrowRight}
        size={18}
        color={getToken("textButtons.small.rest")}
      />
    </SDepositType>
  )
}
