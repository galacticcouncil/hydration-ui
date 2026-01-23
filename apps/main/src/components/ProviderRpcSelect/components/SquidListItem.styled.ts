import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"

import { SRpcListItem } from "./RpcListItem.styled"

export const SSquidListItem = styled(SRpcListItem)`
  grid-template-columns: 1fr 1fr;
  ${mq("sm")} {
    grid-template-columns: 1fr 80px 1fr;
  }
`
