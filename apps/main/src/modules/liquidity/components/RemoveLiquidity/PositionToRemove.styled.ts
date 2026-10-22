import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

export const SPositionToRemove = styled.div<{ selected: boolean }>`
  ${({ theme, selected }) => css`
    display: flex;
    justify-content: space-between;
    padding: ${theme.containers.paddings.quart}
      ${theme.containers.paddings.primary};

    ${selected && `background: ${theme.controls.dim.base}`};

    height: ${pxToRem(45)};
    cursor: pointer;

    &:hover {
      background: ${theme.controls.dim.base};
    }
  `}
`
