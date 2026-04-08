import styled from "@emotion/styled"
import { css } from "@galacticcouncil/ui/utils"

export const SStepTrigger = styled.button<{ isInteractive?: boolean }>(
  ({ theme, isInteractive = false }) => [
    css`
      position: relative;
      display: flex;
      align-items: center;
      gap: ${theme.space.m};
      width: 100%;
      padding-block: ${theme.space.l};
      padding-inline: ${theme.space.xl};

      & > * {
        position: relative;
      }

      &::before {
        content: "";
        position: absolute;
        inset: ${theme.space.s};
        border-radius: ${theme.radii.l};
        background-color: ${theme.details.separators};
        opacity: 0;
        transition: ${theme.transitions.opacity};
      }
    `,
    isInteractive &&
      css`
        &:hover {
          cursor: pointer;
          &::before {
            opacity: 1;
          }
        }
      `,
  ],
)
