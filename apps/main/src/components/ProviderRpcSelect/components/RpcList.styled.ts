import styled from "@emotion/styled"
import { Box } from "@galacticcouncil/ui/components"

import { SRpcListItem } from "@/components/ProviderRpcSelect/components/RpcListItem.styled"

export const SRpcList = styled(Box)`
  display: flex;
  flex-direction: column;

  ${SRpcListItem} {
    border-top: 1px solid ${({ theme }) => theme.details.separators};
    cursor: pointer;
    &:hover,
    &:active {
      transition: ${({ theme }) => theme.transitions.colors};
      background: ${({ theme }) => theme.surfaces.containers.dim.dimOnBg};
    }
  }
`
