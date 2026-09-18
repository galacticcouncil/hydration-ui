import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Paper } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"

export const SDashboardPage = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xxl};
    width: 100%;
    max-width: 1300px;
    margin-inline: auto;
    padding-block: ${theme.space.xl} ${theme.space.xxl};

    ${mq("lg")} {
      padding-top: ${theme.space.l};
    }
  `,
)

export const SDashboardGrid = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.space.l};

    ${mq("md")} {
      grid-template-columns: repeat(12, minmax(0, 1fr));
    }
  `,
)

export const SDashboardOverviewTopRow = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: ${theme.space.l};
    margin-bottom: ${theme.space.l};

    > * {
      grid-column: auto !important;
      min-height: 0 !important;
    }

    ${mq("md")} {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.07fr);
      max-width: 65.625rem;
    }
  `,
)

export const SDashboardViewToolbar = styled.div(
  ({ theme }) => css`
    position: fixed;
    left: 50%;
    bottom: calc(3.75rem + ${theme.space.m} + env(safe-area-inset-bottom));
    z-index: ${theme.zIndices.header};
    display: flex;
    align-items: center;
    gap: ${theme.space.s};
    width: max-content;
    max-width: calc(100vw - ${theme.space.l} * 2);
    padding: ${theme.space.s};
    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.radii.full};
    background-color: color-mix(
      in srgb,
      ${theme.surfaces.containers.high.accent} 92%,
      transparent
    );
    box-shadow: 0 0.75rem 2.5rem
      color-mix(
        in srgb,
        ${theme.surfaces.themeBasePalette.background} 72%,
        transparent
      );
    backdrop-filter: blur(1rem);
    transform: translateX(-50%);

    > p {
      margin-left: ${theme.space.m};
      white-space: nowrap;
    }

    > [data-state-tabs] {
      display: none;
    }

    > [data-state-select] {
      display: flex !important;
    }

    ${mq("md")} {
      > [data-state-tabs] {
        display: flex;
      }

      > [data-state-select] {
        display: none !important;
      }
    }

    ${mq("sm")} {
      bottom: calc(${theme.space.xl} + env(safe-area-inset-bottom));
    }
  `,
)

export const SDashboardSplitView = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: ${theme.space.xxl};

    ${mq("lg")} {
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    }
  `,
)

export const SDashboardColumn = styled.div(
  ({ theme }) => css`
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: ${theme.space.xxl};
  `,
)

export const SConnectedDiscovery = styled.section(
  ({ theme }) => css`
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: ${theme.space.m};
  `,
)

export const SConnectedDiscoveryHeader = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.m};
  `,
)

export const SDashboardCard = styled(Paper, {
  shouldForwardProp: (prop) =>
    !["columns", "featured", "transparent"].includes(prop),
})<{ columns?: number; featured?: boolean; transparent?: boolean }>(
  ({ theme, columns = 6, featured, transparent }) => css`
    position: relative;
    grid-column: 1 / -1;
    min-width: 0;
    overflow: hidden;
    padding: ${theme.space.xl};
    box-shadow: none;

    ${transparent &&
    css`
      && {
        background-color: transparent;
        background-image: none;
      }
    `}

    ${featured &&
    css`
      background: radial-gradient(
          circle at 92% 8%,
          color-mix(in srgb, ${theme.accents.info.primary} 32%, transparent),
          transparent 38%
        ),
        linear-gradient(
          135deg,
          ${theme.surfaces.themeBasePalette.surfaceHigh},
          ${theme.surfaces.containers.dim.dimOnBg}
        );

      &::after {
        content: "";
        position: absolute;
        width: 12rem;
        height: 12rem;
        right: -6rem;
        bottom: -8rem;
        border: 1px solid ${theme.details.borders};
        border-radius: 999px;
        box-shadow:
          0 0 0 2rem
            color-mix(in srgb, ${theme.details.borders} 45%, transparent),
          0 0 0 4rem
            color-mix(in srgb, ${theme.details.borders} 22%, transparent);
        pointer-events: none;
      }
    `}

    ${mq("md")} {
      grid-column: span ${columns};
      min-height: 18rem;
    }
  `,
)

export const SPlainDashboardCard = styled.div<{
  columns?: number
}>(
  ({ columns = 6 }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    grid-column: 1 / -1;
    min-width: 0;

    ${mq("md")} {
      grid-column: span ${columns};
    }
  `,
)

export const SCardHeader = styled.div(
  ({ theme }) => css`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: ${theme.space.l};
    margin-bottom: ${theme.space.xl};
  `,
)

export const SPortfolioCardHeader = styled(SCardHeader)(
  ({ theme }) => css`
    margin-bottom: ${theme.space.m};

    ${mq("md")} {
      margin-bottom: ${theme.space.xl};
    }
  `,
)

export const SNetWorth = styled.div(
  ({ theme }) => css`
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: ${theme.space.s};
    min-width: 0;
  `,
)

export const SPortfolioContent = styled.div(
  ({ theme }) => css`
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: ${theme.space.m};
    flex: 1;

    ${mq("md")} {
      gap: ${theme.space.xl};
    }
  `,
)

export const SPortfolioBalances = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.s};
    min-width: 0;

    ${mq("md")} {
      gap: ${theme.space.m};
    }
  `,
)

export const SPortfolioHeadline = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.m};
    flex-wrap: nowrap;

    ${mq("md")} {
      align-items: flex-end;
      flex-wrap: wrap;
    }
  `,
)

export const SRewardsMetric = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${theme.space.xs};
    min-width: 0;
  `,
)

export const SPortfolioChart = styled.div(
  () => css`
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4.5rem;
    height: 4.5rem;

    ${mq("md")} {
      width: 7rem;
      height: 7rem;
    }
  `,
)

export const SEmptyPortfolioChart = styled.div(
  ({ theme }) => css`
    width: 100%;
    height: 100%;
    border: 0.9rem solid ${theme.details.borders};
    border-radius: ${theme.radii.full};
    background-color: transparent;
  `,
)

export const SMetricGrid = styled.div(
  ({ theme }) => css`
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${theme.space.s};

    > * + * {
      padding-left: ${theme.space.s};
    }

    ${mq("sm")} {
      > * + * {
        padding-left: ${theme.space.m};
        border-left: 1px solid ${theme.details.separators};
      }
    }
  `,
)

export const SMetric = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xs};
    min-width: 0;
  `,
)

export const SList = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xs};
  `,
)

export const SCuratedOpportunityList = styled(SList)(
  ({ theme }) => css`
    gap: ${theme.space.s};
  `,
)

export const SDiscoveryList = styled(SList)(
  () => css`
    gap: 0;

    > a:last-child > div {
      border-bottom-color: transparent;
    }
  `,
)

export const SListRow = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 3.5rem;
    gap: ${theme.space.m};
    padding-block: ${theme.space.base};
    border-bottom: 1px solid ${theme.details.separators};

    &:last-child {
      border-bottom: 0;
    }
  `,
)

export const SExternalPortfolioSection = styled.div(
  ({ theme }) => css`
    margin-inline: -${theme.space.xl};
  `,
)

export const SExternalAssetRow = styled(SListRow)(
  ({ theme }) => css`
    padding-inline: ${theme.space.xl};
  `,
)

export const SPositionLinkRow = styled(SListRow)(
  ({ theme }) => css`
    margin-inline: -${theme.space.m};
    padding-inline: ${theme.space.m};
    border-radius: ${theme.radii.m};
    transition:
      background-color 0.2s ease,
      transform 0.25s ${theme.easings.outExpo};

    [data-position-chevron] {
      display: inline-flex;
      color: ${theme.text.low};
      transition: transform 0.2s ease;
    }

    &:hover {
      background: ${theme.surfaces.containers.dim.dimOnBg};
      transform: translateX(0.2rem);

      [data-position-chevron] {
        transform: translateX(0.15rem);
      }
    }
  `,
)

export const SCuratedOpportunityRow = styled(SListRow)(
  ({ theme }) => css`
    min-height: 4rem;
    flex-direction: column;
    align-items: stretch;
    padding: ${theme.space.m};
    border: 1px solid ${theme.details.separators};
    border-radius: ${theme.radii.l};
    background-color: ${theme.surfaces.themeBasePalette.surfaceHigh};

    &&:last-child {
      border-bottom: 1px solid ${theme.details.separators};
    }

    ${mq("sm")} {
      flex-direction: row;
      align-items: center;
    }
  `,
)

export const SOpportunityPills = styled.div(
  ({ theme }) => css`
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: stretch;
    gap: ${theme.space.xs};
    width: 100%;
    min-width: 0;
    flex-wrap: nowrap;

    ${mq("sm")} {
      flex: 1 1 14rem;
      justify-content: flex-end;
      gap: ${theme.space.s};
      width: auto;
      flex-wrap: wrap;
    }
  `,
)

export const SOpportunityPill = styled.button(
  ({ theme }) => css`
    display: inline-flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    gap: ${theme.space.xs};
    min-width: 0;
    min-height: 2rem;
    padding: ${theme.space.base} ${theme.space.xs};
    border: 1px solid transparent;
    border-radius: ${theme.radii.full};
    background-color: ${theme.tags.soft.green.background};
    color: ${theme.tags.soft.green.foreground};
    font: inherit;
    font-size: ${theme.fontSizes.p6};
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;

    strong {
      flex-shrink: 0;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    > span:first-of-type {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    > [data-opportunity-chevron] {
      display: none;
      opacity: 0.6;
      transition: transform 0.2s ease;
    }

    ${mq("sm")} {
      flex: 0 0 auto;
      justify-content: flex-start;
      gap: ${theme.space.s};
      padding-inline: ${theme.space.m};
      font-size: ${theme.fontSizes.p5};

      > [data-opportunity-chevron] {
        display: inline-flex;
      }
    }

    &:hover {
      border-color: color-mix(
        in srgb,
        ${theme.tags.soft.green.foreground} 35%,
        transparent
      );
      background-color: color-mix(
        in srgb,
        ${theme.tags.soft.green.foreground} 20%,
        ${theme.tags.soft.green.background}
      );

      > [data-opportunity-chevron] {
        transform: translateX(0.125rem);
      }
    }

    &:focus-visible {
      outline: 2px solid ${theme.tags.soft.green.foreground};
      outline-offset: 2px;
    }
  `,
)

export const SDiscoveryRow = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 3.25rem;
    gap: ${theme.space.m};
    margin-inline: -${theme.space.m};
    padding: ${theme.space.xs} ${theme.space.m};
    border-bottom: 1px solid ${theme.details.separators};
    border-radius: ${theme.radii.m};
    transition:
      background-color 0.2s ease,
      transform 0.25s ${theme.easings.outExpo};

    &:hover {
      background: ${theme.surfaces.containers.dim.dimOnBg};
      transform: translateX(0.2rem);
    }
  `,
)

export const SAssetIdentity = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    min-width: 0;
    gap: ${theme.space.m};
  `,
)

export const SEmptyState = styled.div(
  ({ theme }) => css`
    display: flex;
    min-height: 10rem;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: ${theme.space.m};
    color: ${theme.text.low};
  `,
)

export const SEarnHeader = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.l};

    ${mq("md")} {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
    }
  `,
)

export const SFilterBar = styled.div(
  ({ theme }) => css`
    display: flex;
    max-width: 100%;
    gap: ${theme.space.s};
    overflow-x: auto;
    padding-bottom: 1px;
  `,
)

export const SCompactFilterBar = styled.div(
  ({ theme }) => css`
    [role="radio"] {
      padding-inline: ${theme.space.base};
    }
  `,
)

export const SFilterButton = styled.button<{ active: boolean }>(
  ({ theme, active }) => css`
    flex-shrink: 0;
    padding: ${theme.space.base} ${theme.space.m};
    border: 1px solid
      ${active ? theme.buttons.primary.medium.rest : theme.details.borders};
    border-radius: ${theme.radii.full};
    background: ${active
      ? theme.buttons.primary.medium.rest
      : theme.surfaces.themeBasePalette.surfaceHigh};
    color: ${active
      ? theme.buttons.primary.medium.onButton
      : theme.text.medium};
    font: inherit;
    font-size: ${theme.fontSizes.p5};
    font-weight: 500;
    cursor: pointer;
    transition: ${theme.transitions.colors};

    &:hover {
      border-color: ${theme.buttons.primary.medium.hover};
    }
  `,
)

export const SOpportunityGrid = styled.div<{ compact?: boolean }>(
  ({ theme, compact }) => css`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.space.base};

    ${mq("md")} {
      grid-template-columns: repeat(${compact ? 2 : 12}, minmax(0, 1fr));

      ${compact &&
      css`
        grid-template-rows: repeat(3, minmax(10rem, auto));
      `}

      > * {
        grid-column: ${compact ? "auto" : "span 4"};
      }

      ${!compact &&
      css`
        > :nth-of-type(6n + 1),
        > :nth-of-type(6n + 6) {
          grid-column: span 5;
        }

        > :nth-of-type(6n + 2),
        > :nth-of-type(6n + 5) {
          grid-column: span 3;
        }
      `}
    }
  `,
)

export const SOpportunityCard = styled.button(
  ({ theme }) => css`
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 0;
    flex-direction: column;
    padding: ${theme.space.l};
    padding-bottom: ${theme.space.m};
    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.radii.xl};
    background-color: ${theme.surfaces.themeBasePalette.surfaceHigh};
    color: inherit;
    font: inherit;
    text-align: left;
    box-shadow: none;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      border-color: color-mix(
        in srgb,
        ${theme.buttons.primary.medium.rest} 45%,
        ${theme.details.borders}
      );
      background-color: color-mix(
        in srgb,
        ${theme.surfaces.themeBasePalette.surfaceHigh} 95%,
        ${theme.buttons.primary.medium.rest}
      );
    }

    &:focus-visible {
      outline: 2px solid ${theme.buttons.primary.medium.rest};
      outline-offset: 2px;
    }

    ${mq("sm")} {
      min-height: 10rem;
      padding-bottom: ${theme.space.l};
    }
  `,
)

export const SOpportunityTop = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${theme.space.base};
    margin-bottom: ${theme.space.s};
  `,
)

export const SOpportunityMobileRate = styled.div(
  () => css`
    display: flex;

    ${mq("sm")} {
      display: none;
    }
  `,
)

export const SOpportunityDesktopRate = styled.div(
  () => css`
    display: none;

    ${mq("sm")} {
      display: flex;
    }
  `,
)

export const SOpportunityFooter = styled.div<{ $hasAction?: boolean }>(
  ({ theme, $hasAction }) => css`
    display: ${$hasAction ? "flex" : "none"};
    align-items: flex-end;
    justify-content: space-between;
    gap: ${theme.space.base};
    margin-top: auto;
    padding-top: ${theme.space.s};

    ${mq("sm")} {
      display: flex;
    }
  `,
)
