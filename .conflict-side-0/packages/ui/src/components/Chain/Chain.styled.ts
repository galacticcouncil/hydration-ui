import { createVariants, css, styled } from "@/utils"

export type ChainVariant = "desktop" | "mobile"

const variants = createVariants<ChainVariant>((theme) => ({
  desktop: css`
    display: flex;
    align-items: center;
    gap: ${theme.scales.paddings.s}px;

    padding: ${theme.scales.paddings.base}px;
    border-radius: 8px;

    & > svg {
      width: 20px;
      height: 20px;
    }
  `,
  mobile: css`
    display: flex;
    align-items: center;
    gap: 6px;

    padding: ${theme.scales.paddings.s}px;
    border-radius: 4px;

    background: ${theme.colors.darkBlue.alpha[500]};
    border: 1px solid ${theme.colors.darkBlue.alpha[500]};

    & > svg {
      width: 24px;
      height: 24px;
    }
  `,
}))

export const SChainContainer = styled.div<{
  readonly variant?: ChainVariant
  readonly isActive?: boolean
}>(({ theme, variant = "desktop", isActive }) => [
  css`
    ${isActive &&
    css`
      background: ${theme.buttons.secondary.accent.rest};
      border: 1px solid ${theme.buttons.secondary.accent.outline};
    `}
    &:active,
    &:focus {
      background: ${theme.buttons.secondary.accent.rest};
      border: 1px solid ${theme.buttons.secondary.accent.outline};
    }

    &:hover {
      background: ${theme.buttons.secondary.accent.hover};
      border: 1px solid ${theme.buttons.secondary.accent.outline};
    }

    cursor: pointer;
  `,
  variants(variant),
])
