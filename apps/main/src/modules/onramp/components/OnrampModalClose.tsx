import { Flex, ModalClose } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { useOnrampClosable } from "@/modules/onramp/hooks/useOnrampClosable"

// For headerless steps; closing the modal unmounts the flow, which resets it.
export const OnrampModalClose: FC = () => {
  const closable = useOnrampClosable()

  if (!closable) return null

  return (
    <Flex justify="end" position="relative">
      <ModalClose />
    </Flex>
  )
}
