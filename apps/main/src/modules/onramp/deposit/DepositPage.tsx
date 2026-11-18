import { Flex, ModalContainer } from "@galacticcouncil/ui/components"

import { DepositFlow } from "@/modules/onramp/deposit/DepositFlow"
import { useOnrampContentWidth } from "@/modules/onramp/hooks/useOnrampContentWidth"

export const DepositPage = () => {
  const contentWidth = useOnrampContentWidth()

  return (
    <Flex direction="column" align="center">
      <ModalContainer open contentWidth={contentWidth}>
        <DepositFlow />
      </ModalContainer>
    </Flex>
  )
}
