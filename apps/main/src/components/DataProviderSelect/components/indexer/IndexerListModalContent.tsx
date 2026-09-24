import { ModalBody, Separator, Stack } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import {
  IndexerStatusHeader,
  IndexerStatusItem,
} from "@/components/DataProviderSelect/components/indexer/IndexerStatusItem"

export const IndexerListModalContent = () => (
  <ModalBody>
    <Stack bg={getToken("surfaces.containers.dim.dimOnBg")} borderRadius="m">
      <IndexerStatusHeader />
      <Separator />
      <IndexerStatusItem />
    </Stack>
  </ModalBody>
)
