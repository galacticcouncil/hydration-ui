import {
  Stack,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const JsonViewRoot = styled(TabsRoot)`
  position: relative;
`

export const JsonViewContainer = styled(Stack)(
  ({ theme }) => css`
    gap: ${theme.space.m};

    margin-bottom: var(--modal-content-inset);

    background: ${theme.surfaces.containers.high.hover};

    height: ${theme.sizes["4xl"]};
  `,
)

export const JsonViewTabsTrigger = styled(TabsTrigger)(
  ({ theme }) => css`
    font-weight: 700;
    font-size: ${theme.fontSizes.p6};
    color: ${theme.text.low};
    text-transform: uppercase;

    cursor: pointer;

    transition: ${theme.transitions.colors};

    &:hover {
      color: ${theme.text.medium};
    }

    &[data-state="active"] {
      color: ${theme.buttons.primary.medium.rest};
    }
  `,
)

export const JsonViewTabsList = styled(TabsList)(
  ({ theme }) => css`
    position: relative;
    z-index: 1;

    display: flex;
    gap: ${theme.space.m};

    margin-bottom: -${theme.space.m};
    padding-block: ${theme.space.base};

    border-bottom: 1px solid ${theme.details.borders};
    padding-inline: ${theme.space.l};

    background: ${theme.surfaces.containers.high.hover};
  `,
)
