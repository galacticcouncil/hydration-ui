import { createVariants, css, styled } from "@/utils"

export type ChainVariant = "desktop" | "mobile"

const variants = createVariants<ChainVariant>((theme) => ({
  desktop: css`
    display: flex;
    align-items: center;
    gap: ${theme.space.s};

    padding: ${theme.space.base};
    border-radius: ${theme.space.base};

    & > svg {
      width: ${theme.space.xl};
      height: ${theme.space.xl};
    }
  `,
  mobile: css`
    display: flex;
    align-items: center;
    gap: ${theme.space.base};

    padding: ${theme.space.s};
    border-radius: ${theme.space.s};

    background: ${theme.colors.darkBlue.alpha[500]};
    border: 1px solid ${theme.colors.darkBlue.alpha[500]};

    & > svg {
      width: ${theme.space.m};
      height: ${theme.space.m};
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
