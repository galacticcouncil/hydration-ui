import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Box } from "@/components/Box"
import { Flex } from "@/components/Flex"
import { StepState } from "@/components/Stepper"
import { Text } from "@/components/Text"
import { mq } from "@/theme"

export const SStepperContainer = styled(Box)`
  margin: 0 auto;
  width: 100%;
  ${mq("sm")} {
    padding-bottom: 20px;
  }
`

export const SStepContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

export const SStepLabel = styled(Text)(
  ({ theme }) => css`
    font-size: ${theme.paragraphSize.p6};
    font-weight: 500;

    display: none;

    ${mq("sm")} {
      display: block;
      position: absolute;
      top: 100%;
      white-space: nowrap;
    }
  `,
)

export const SDesktopContainer = styled(Box)(
  ({ maxWidth }) => css`
    flex-direction: row;
    align-items: center;
    justify-content: center;

    margin: 0 auto;

    display: none;

    ${mq("sm")} {
      display: flex;
    }

    & > div {
      position: relative;
    }

    & > div:first-of-type > p {
      left: ${!maxWidth || maxWidth === "100%" ? "0" : "auto"};
    }

    & > div:last-of-type > p {
      right: ${!maxWidth || maxWidth === "100%" ? "0" : "auto"};
    }
  `,
)

export const SCircle = styled(Box)<{ state: StepState }>(
  ({ theme, state }) => css`
    width: 24px;
    height: 24px;

    font-size: ${theme.paragraphSize.p4};
    font-family: ${theme.fontFamilies1.primary};
    font-weight: 600;

    border-radius: ${theme.radii.full}px;
    border: 1px solid
      ${state === StepState.Todo
        ? theme.buttons.primary.medium.rest
        : "transparent"};

    transition: ${theme.transitions.colors};
    flex-shrink: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    background: ${state === StepState.Active
      ? theme.buttons.primary.medium.rest
      : state === StepState.Done
        ? theme.details.separators
        : "transparent"};

    color: ${state === StepState.Active
      ? theme.buttons.primary.medium.onButton
      : theme.buttons.primary.medium.rest};
  `,
)

export const SStepperLine = styled(Box)(
  ({ theme }) => css`
    height: 1px;
    flex-grow: 1;
    background: ${theme.details.separators};
    margin: 0 8px;
  `,
)

export const SMobileContainer = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  display: flex;

  ${mq("sm")} {
    display: none;
  }
`
