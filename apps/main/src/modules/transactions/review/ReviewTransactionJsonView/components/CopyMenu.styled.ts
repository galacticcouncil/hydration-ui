import { DropdownMenuTrigger } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

export const CopyMenuTrigger = styled(DropdownMenuTrigger)`
  position: absolute;

  cursor: pointer;

  font-size: ${({ theme }) => theme.fontSizes.p3};
  font-weight: 500;
  color: ${({ theme }) => theme.text.medium};

  display: flex;
  gap: ${({ theme }) => theme.space.s};
  align-items: center;
  padding: ${({ theme }) => theme.space.base};

  top: 2px;
  right: 4px;

  z-index: 1;

  &:hover {
    color: ${({ theme }) => theme.buttons.primary.medium.hover};
  }
`
