import styled from "@emotion/styled"

import { Flex } from "@/components/Flex"
import { LOGO_SIZES } from "@/components/Logo/Logo.styled"
import { WizardStepState } from "@/components/WizardStep/WizardStep"
import { createVariants, css, pxToRem } from "@/utils"

const stepIndicatorVariants = createVariants<WizardStepState>((theme) => ({
  active: css`
    background-color: ${theme.buttons.primary.medium.rest};
    border-color: ${theme.buttons.primary.medium.rest};
  `,
  done: css`
    background-color: ${theme.details.separators};
    border-color: transparent;
  `,
  todo: css`
    background-color: transparent;
    border-color: ${theme.buttons.primary.medium.rest};
  `,
}))

export const SStepIndicator = styled(Flex, {
  shouldForwardProp: (prop) => prop !== "state",
})<{ state: WizardStepState }>(({ state }) => [
  css`
    align-items: center;
    justify-content: center;
    width: ${pxToRem(LOGO_SIZES.medium)};
    height: ${pxToRem(LOGO_SIZES.medium)};
    border-radius: 50%;
    flex-shrink: 0;
    border: 1px solid transparent;
  `,
  stepIndicatorVariants(state),
])

export const SWizardStep = styled.button<{ isInteractive?: boolean }>(
  ({ theme, isInteractive = false }) => [
    css`
      position: relative;
      display: flex;
      align-items: center;
      gap: ${theme.space.m};
      width: 100%;
      padding-block: ${theme.space.l};
      padding-inline: ${theme.space.s};

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

      &:focus-visible {
        outline: 2px solid ${theme.buttons.secondary.accent.outline};
        outline-offset: -2px;
        border-radius: ${theme.radii.l};
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
