import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Content, Item, Trigger, Viewport } from "@radix-ui/react-select"

export const SelectTrigger = styled(Trigger)(
  ({ theme }) => css`
    padding: ${theme.buttons.paddings.tertiary}
      ${theme.buttons.paddings.primary};

    cursor: pointer;

    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${theme.space.s};

    font-size: 12px;

    border-radius: ${theme.containers.cornerRadius.buttonsPrimary};
    border: 1px solid ${theme.buttons.outlineDark.onOutline};
    background: ${theme.surfaces.themeBasePalette.surfaceHigh};

    transition: all 0.3s ease-in-out;

    &:hover {
      background: ${theme.buttons.secondary.low.hover};
      border-color: ${theme.buttons.secondary.low.hover};
    }
  `,
)

export const SContent = styled(Content)(
  ({ theme }) => css`
    border-radius: 12px;
    border: 1px solid ${theme.details.borders};
    background: ${theme.surfaces.containers.high.primary};

    padding: 10px;

    box-shadow: 0px 8px 30px 0px rgba(41, 41, 60, 0.41);

    z-index: ${theme.zIndices.popover};
  `,
)

export const SItem = styled(Item)(
  ({ theme }) => css`
    all: unset;

    font-size: ${theme.fontSizes.p3};
    line-height: 140%;

    cursor: pointer;
    min-width: 100px;
    color: ${theme.text.medium};

    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1 0 0;

    padding: ${theme.buttons.paddings.quart} ${theme.buttons.paddings.secondary};

    border-radius: ${theme.containers.cornerRadius.buttonsPrimary};

    transition: all 0.3s ease-in-out;

    &[data-state="checked"] {
      color: ${theme.text.tint.secondary};
      background: ${theme.buttons.secondary.low.hover};
    }

    &[data-highlighted] {
      color: ${theme.text.high};
      background: ${theme.buttons.secondary.low.hover};
    }
  `,
)

export const SViewport = styled(Viewport)(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.s};
    z-index: ${theme.zIndices.popover};
  `,
)
