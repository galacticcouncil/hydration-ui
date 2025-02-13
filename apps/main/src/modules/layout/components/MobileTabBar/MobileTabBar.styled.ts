import styled from "@emotion/styled"
import { Icon } from "@galacticcouncil/ui/components"
import { css } from "@galacticcouncil/ui/utils"

export const SMobileTabBar = styled.nav(
  ({ theme }) => css`
    position: fixed;
    left: 0;
    bottom: 0;

    width: 100%;
    height: 60px;

    display: flex;
    justify-content: space-between;

    background-color: ${theme.surfaces.containers.high.accent};
    border-top: 1px solid ${theme.details.separators};
  `,
)

export const STabBarItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;

  height: 50px;
  padding: 7px 17px 5px 17px;

  text-decoration: none;

  &:focus {
    outline: none;
  }
`

export const STabBarIcon = styled(Icon)(
  ({ theme }) => css`
    color: ${theme.icons.soft};

    *[data-status="active"] &,
    ${STabBarItem}[data-state="open"] &,
    ${STabBarItem}:hover & {
      color: ${theme.controls.solid.activeHover};
    }
  `,
)

export const STabBarLabel = styled.span(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;

    color: ${theme.text.low};

    white-space: nowrap;

    *[data-status="active"] &,
    ${STabBarItem}[data-state="open"] &,
    ${STabBarItem}:hover & {
      color: ${theme.textButtons.small.hover};
    }
  `,
)

export const STabBarMenuAction = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;

    padding: ${theme.scales.paddings.m}px
      ${theme.containers.paddings.tertiary}px;

    cursor: pointer;

    & svg {
      height: 24px;
      width: 24px;

      color: ${theme.icons.onSurface};
    }

    &:active svg,
    &:focus svg,
    &:hover svg {
      color: ${theme.controls.solid.activeHover};
    }
  `,
)
