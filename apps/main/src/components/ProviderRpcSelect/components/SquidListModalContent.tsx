import { ModalBody } from "@galacticcouncil/ui/components"

import { SquidList } from "@/components/ProviderRpcSelect/components/SquidList"

export const SquidListModalContent = () => {
  return (
    <ModalBody noPadding scrollable={false}>
      <SquidList />
    </ModalBody>
  )
}
