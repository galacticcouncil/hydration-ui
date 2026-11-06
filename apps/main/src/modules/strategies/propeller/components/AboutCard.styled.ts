import { Flex, Stack } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

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
    --juicer-illustration-width: 5rem;
    gap: calc(${theme.space.m} / 2);

    @media (max-width: 480px) {
      --juicer-illustration-width: 3.25rem;
      gap: calc(${theme.space.s} / 2);
    }

    &:not(:last-child)::after {
      content: "";
      position: absolute;
      left: calc(var(--juicer-illustration-width) / 2 - 0.5px);
      top: calc(var(--juicer-illustration-width) * 5 / 7 + ${theme.space.s});
      bottom: calc(-1 * ${theme.space.xl} + ${theme.space.s});
      width: 1px;
      background: ${theme.details.separators};
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

export const SJuicerExplainerIllustration = styled("img")(css`
  display: block;
  flex: 0 0 var(--juicer-illustration-width);
  width: var(--juicer-illustration-width);
  height: calc(var(--juicer-illustration-width) * 5 / 7);
  align-self: flex-start;
  object-fit: contain;
  object-position: center;
  user-select: none;
  pointer-events: none;
`)
