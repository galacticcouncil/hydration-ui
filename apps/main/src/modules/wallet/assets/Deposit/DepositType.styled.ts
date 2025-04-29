import { styled } from "@galacticcouncil/ui/utils"

export const SDepositType = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;

  padding: 16px 20px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.buttons.secondary.low.rest};

  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.buttons.secondary.low.hover};
  }
`
