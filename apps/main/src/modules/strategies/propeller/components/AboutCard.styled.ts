import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Flex, Stack } from "@galacticcouncil/ui/components"

export const SJuicerExplainerFlow = styled(Stack)(
  ({ theme }) => css`
    list-style: none;
    margin: 0;
    padding: 0;
    gap: ${theme.space.xl};
  `,
)

export const SJuicerExplainerStep = styled(Flex)(
  ({ theme }) => css`
    position: relative;
    gap: ${theme.space.m};

    &:not(:last-child)::after {
      content: "";
      position: absolute;
      left: calc(1rem - 0.5px);
      top: 2rem;
      bottom: calc(-1 * ${theme.space.xl});
      width: 1px;
      background: ${theme.details.separators};
    }
  `,
)

export const SJuicerExplainerNumber = styled(Flex)(
  ({ theme }) => css`
    flex: 0 0 2rem;
    height: 2rem;
    border: 1px solid ${theme.text.tint.secondary};
    border-radius: 50%;
    color: ${theme.text.high};

    /* Optically center the Gazpacho numerals within the circle. */
    & > p {
      transform: translateY(0.08em);
    }
  `,
)

export const SJuicerExplainerPanel = styled(Stack)(
  ({ theme }) => css`
    flex: 1;
    min-width: 0;
    gap: ${theme.space.s};
  `,
)
