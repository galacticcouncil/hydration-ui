import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Table, TableRow } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"

/** Compact table whose outer cells line up with the modal's content padding. */
export const SOptionTable = styled(Table)(
  ({ theme }) => css`
    thead th,
    tbody td {
      padding-inline: ${theme.space.base};
    }

    /* two-word headers wrap so every column fits at phone width */
    thead th {
      white-space: normal;
      line-height: 1.2;

      ${mq("sm")} {
        white-space: nowrap;
      }
    }

    thead th:first-of-type,
    tbody td:first-of-type {
      width: 100%;
      padding-left: var(--modal-content-padding);
    }

    thead th:last-of-type,
    tbody td:last-of-type {
      padding-right: var(--modal-content-padding);
    }
  `,
)

export const SOptionRow = styled(TableRow)<{ selected: boolean }>(
  ({ theme, selected }) => css`
    background-color: ${selected
      ? theme.surfaces.containers.dim.dimOnBg
      : "transparent"};

    &:focus-visible {
      outline: none;
      background-color: ${theme.surfaces.containers.high.hover};
    }

    &[aria-disabled="true"] {
      cursor: default;
    }
  `,
)
