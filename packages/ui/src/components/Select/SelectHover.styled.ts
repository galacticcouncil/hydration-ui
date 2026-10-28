import styled from "@emotion/styled"

import { SContent } from "../Popover"

export const SSelectHoverContent = styled(SContent)`
  min-width: var(--radix-popover-trigger-width);
  padding: ${({ theme }) => theme.space.s};
  background-color: ${({ theme }) => theme.surfaces.containers.high.primary};
  border: 1px solid ${({ theme }) => theme.details.borders};
  border-radius: ${({ theme }) => theme.radii.l};
  box-shadow: 0 3px 9px oklch(0 0 none / 0.1);

  --menu-item-padding: ${({ theme }) => theme.space.base};
  --menu-item-gap: ${({ theme }) => theme.space.s};
  --menu-item-font-size: ${({ theme }) => theme.fontSizes.p5};
  --menu-item-font-weight: 500;
  --menu-item-line-height: 1.3;
  --menu-item-icon-size: ${({ theme }) => theme.sizes.m};

  & [data-radix-scroll-area-viewport] {
    max-height: calc(
      var(--radix-popover-content-available-height) - 2px -
        ${({ theme }) => theme.space.s} * 2
    );
  }
`
