import { css, styled } from "@galacticcouncil/ui/utils"

import { optionTile } from "@/components/account/OptionTile.styled"

export const SAccountOption = styled.div<{
  disabled?: boolean
}>(
  ({ theme, disabled }) => css`
    ${optionTile(theme)}

    position: relative;
    width: 100%;
    min-height: 4rem;
    min-width: 0;

    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: ${theme.space.s} ${theme.space.l};

    ${disabled &&
    css`
      cursor: default;

      &:hover {
        background: ${theme.surfaces.containers.dim.dimOnBg};
        border-color: transparent;
      }
    `}
  `,
)
