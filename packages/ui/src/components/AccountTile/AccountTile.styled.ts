import { css, styled } from "@/utils"

export const SAccountTileContainer = styled.div<{ readonly active?: boolean }>(
  ({ theme, active }) => css`
    display: grid;
    grid-template-columns: auto 1fr auto;
    column-gap: 8px;

    background: ${active ? theme.controls.dim.active : theme.controls.dim.base};
    border-radius: ${theme.scales.cornerRadius.xl}px;
    padding: ${theme.containers.paddings.secondary}px;

    &:hover {
      background: ${theme.controls.dim.active};
    }
  `,
)
