import styled from "@emotion/styled"
import { Icon } from "@galacticcouncil/ui/components"
import { css } from "@galacticcouncil/ui/utils"

export const SMobileTabBar = styled.nav(
  ({ theme }) => css`
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: ${theme.zIndices.header};

    width: 100%;
    height: 3.75rem;

    display: flex;
    justify-content: space-between;
    align-items: center;

    background-color: ${theme.surfaces.containers.high.accent};
    border-top: 1px solid ${theme.details.separators};
  `,
)

export const STabBarItem = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.space.s};

    height: 3.125rem;
    padding-inline: ${theme.space.m};
    padding-block: ${theme.space.base};

    text-decoration: none;

    &:focus {
      outline: none;
    }
  `,
)

export const STabBarIcon = styled(Icon)(
  ({ theme }) => css`
    color: ${theme.icons.onSurface};
    width: 1.25rem;
    height: 1.25rem;

    *[data-status="active"] &,
    ${STabBarItem}[data-state="open"] & {
      color: ${theme.controls.solid.activeHover};
    }
  `,
)

export const STabBarLabel = styled.span(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 500;
    font-size: ${theme.fontSizes.p5};
    line-height: ${theme.lineHeights.m};

    color: ${theme.text.low};

    white-space: nowrap;

    *[data-status="active"] &,
    ${STabBarItem}[data-state="open"] & {
      color: ${theme.textButtons.small.hover};
    }
  `,
)

export const STabBarMenuAction = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.space.base};

    padding: ${theme.space.m} ${theme.containers.paddings.tertiary};

    cursor: pointer;

    & svg {
      height: 1.25rem;
      width: 1.25rem;

      color: ${theme.icons.onSurface};
    }

    &:active svg,
    &:focus svg,
    &:hover svg {
      color: ${theme.controls.solid.activeHover};
    }
  `,
)
