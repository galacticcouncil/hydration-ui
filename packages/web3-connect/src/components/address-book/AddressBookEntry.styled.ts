import { Box, Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SAddressBookEntry = styled(Flex)<{
  disabled?: boolean
}>(
  ({ theme, disabled }) => css`
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.base};

    padding-inline: ${theme.space.m};
    padding-block: ${theme.space.m};

    ${!disabled &&
    css`
      cursor: pointer;

      &:hover {
        background: ${theme.controls.dim.accent};
      }
    `}
  `,
)

export const SAddressBookEntryModeIcon = styled(Box)(
  ({ theme }) => css`
    position: absolute;
    right: -${theme.space.s};
    bottom: -${theme.space.s};
    overflow: hidden;
    border: 1px solid ${theme.surfaces.themeBasePalette.surfaceHigh};
    border-radius: ${theme.radii.full};
  `,
)
