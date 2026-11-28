import { Flex, ModalContainer } from "@galacticcouncil/ui/components"

import { useOnrampContentWidth } from "@/modules/onramp/hooks/useOnrampContentWidth"
import { WithdrawFlow } from "@/modules/onramp/withdraw/WithdrawFlow"

export const WithdrawPage = () => {
  const contentWidth = useOnrampContentWidth()

  return (
    <Flex direction="column" align="center">
      <ModalContainer open contentWidth={contentWidth}>
        <WithdrawFlow />
      </ModalContainer>
    </Flex>
  )
}
