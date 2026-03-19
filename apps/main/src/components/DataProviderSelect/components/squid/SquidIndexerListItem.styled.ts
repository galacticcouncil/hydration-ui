import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"

import { SRpcListItem } from "@/components/DataProviderSelect/components/rpc/RpcListItem.styled"

export const SSquidIndexerListItem = styled(SRpcListItem)`
  grid-template-columns: 1fr 1fr;
  ${mq("sm")} {
    grid-template-columns: 1fr 6rem 1fr;
  }
`
