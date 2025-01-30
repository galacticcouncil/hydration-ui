import { Box } from "@galacticcouncil/ui/components"
import { getToken, styled } from "@galacticcouncil/ui/utils"

const SButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;

  border: 1px solid ${({ theme }) => getToken("details.borders")(theme)};
`

export const Web3ConnectProviderButton = () => {
  return <SButton>lel</SButton>
}

/* background: ${({ theme }) =>
    getToken("surfaces.containers.dim.dimOnBg")(theme)}; */
