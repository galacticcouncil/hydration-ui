import { css, styled } from "@/utils"
export const SAccountTileContainer = styled.div<{
  readonly active?: boolean
  readonly isInteractive?: boolean
}>(({ theme, active, isInteractive }) => [
  css`
    display: grid;
    grid-template-columns: auto 1fr auto;
    column-gap: 8px;

    background: ${active ? theme.controls.dim.active : theme.controls.dim.base};
    border: 1px solid ${active ? theme.controls.dim.active : "transparent"};
    border-radius: ${theme.radii.m};
    padding: ${theme.containers.paddings.secondary};
  `,
  isInteractive &&
    css`
      cursor: pointer;
      &:hover {
        background: ${active
          ? theme.controls.dim.activeHover
          : theme.controls.dim.active};
      }
    `,
])
