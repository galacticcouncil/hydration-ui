import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box } from "@galacticcouncil/ui/components"

export const SRecipientDropdown = styled(Box)(
  ({ theme }) => css`
    position: fixed;
    z-index: ${theme.zIndices.popover};
    padding-block: ${theme.space.s};
    padding-inline: ${theme.space.s};
    box-sizing: border-box;
    background: ${theme.surfaces.containers.high.hover};
    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.radii.xl};
    overflow: hidden;
    box-shadow: 0 10px 15px rgb(0 0 0 / 25%);
  `,
)

export const SRecipientOption = styled.button(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.m};
    width: 100%;
    padding: ${theme.space.base} ${theme.space.l};
    color: ${theme.text.high};
    text-align: left;
    background: transparent;
    border: 0;
    border-radius: ${theme.radii.m};
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: ${theme.buttons.outlineDark.hover};
    }
  `,
)

export const SRecipientContactsOption = styled(SRecipientOption)(
  ({ theme }) => css`
    gap: ${theme.space.base};
    padding: ${theme.space.m} ${theme.space.l};
    color: ${theme.text.medium};
  `,
)
