import { DropdownMenuTrigger } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

export const CopyMenuTrigger = styled(DropdownMenuTrigger)`
  position: absolute;

  cursor: pointer;

  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.medium};

  display: flex;
  gap: 4px;
  align-items: center;
  padding: 8px;

  top: 2px;
  right: 4px;

  z-index: 1;

  &:hover {
    color: ${({ theme }) => theme.buttons.primary.medium.hover};
  }
`
