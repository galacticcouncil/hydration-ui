import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box } from "@galacticcouncil/ui/components"

/**
 * Token chip with logo + symbol — used in the deposit/withdraw/borrow modal
 * input rows. The rest of this module's styling now lives inline (sx /
 * Paper variants), so this file is intentionally small.
 */
export const STokenPill = styled(Box)(
  ({ theme }) => css`
    all: unset;
    box-sizing: border-box;

    display: flex;
    gap: 6px;
    align-items: center;

    padding: ${theme.space.s};
    padding-right: ${theme.space.m};
    min-width: fit-content;

    border-radius: 30px;
    border: 1px solid ${theme.buttons.secondary.low.borderRest};
  `,
)
