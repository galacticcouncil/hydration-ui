import { Flex, Stack } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SAboutFlow = styled(Stack)(
  ({ theme }) => css`
    list-style: none;
    margin: 0;
    padding: 0;
    gap: ${theme.space.xl};
  `,
)

export const SAboutStep = styled(Flex)(
  ({ theme }) => css`
    position: relative;
    gap: ${theme.space.m};

    &:not(:last-child)::after {
      content: "";
      position: absolute;
      left: calc(${theme.sizes.xl} / 2 - 0.5px);
      top: calc(${theme.sizes.xl} + ${theme.space.s});
      bottom: calc(-1 * ${theme.space.xl} + ${theme.space.s});
      width: 1px;
      background: ${theme.details.separators};
    }
  `,
)

// ponytail: mirrors the Stepper's "todo" circle from @galacticcouncil/ui
export const SAboutNumber = styled("span")(
  ({ theme }) => css`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: ${theme.sizes.xl};
    height: ${theme.sizes.xl};

    font-family: ${theme.fontFamilies1.primary};
    font-size: ${theme.fontSizes.p5};
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: ${theme.text.high};

    border: 1px solid ${theme.buttons.primary.medium.rest};
    border-radius: ${theme.radii.full};
  `,
)

export const SAboutPanel = styled(Stack)(
  ({ theme }) => css`
    flex: 1;
    min-width: 0;
    gap: ${theme.space.s};
  `,
)
