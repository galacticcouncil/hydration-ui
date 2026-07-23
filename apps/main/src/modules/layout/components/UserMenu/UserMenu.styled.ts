import { Button, Flex, MenuSelectionItem } from "@galacticcouncil/ui/components"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

// Revealed on tile hover for pointer devices; always visible on touch.
export const SHoverActions = styled(Flex)(
  () => css`
    @media (hover: hover) {
      opacity: 0;
      transition: opacity 0.15s ease-in-out;

      ${MenuSelectionItem}:hover & {
        opacity: 1;
      }
    }
  `,
)

export const SSplitContainer = styled.div(
  ({ theme }) => css`
    display: inline-flex;
    align-items: stretch;
    height: ${pxToRem(36)};

    & > *:first-of-type {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    & > *:last-of-type {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-left: 1px solid ${theme.surfaces.themeBasePalette.background};
    }
  `,
)

export const SCaretButton = styled(Button)(
  ({ theme }) => css`
    background: ${theme.buttons.outlineDark.rest};
    padding: 0 ${theme.space.s};
    height: ${pxToRem(36)};
    min-width: ${pxToRem(32)};

    &:not(:disabled):hover,
    &:not(:disabled):active,
    &[data-state="open"] {
      background: ${theme.buttons.outlineDark.hover};
    }
  `,
)
