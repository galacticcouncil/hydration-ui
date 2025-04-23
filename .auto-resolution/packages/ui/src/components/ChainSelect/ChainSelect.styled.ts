import { createVariants, css, styled } from "@galacticcouncil/ui/utils"
import { ButtonHTMLAttributes } from "react"

export type ChainSelectVariant = "desktop" | "mobile" | "mobile-compact"

const variants = createVariants<ChainSelectVariant>((theme) => ({
  desktop: css`
    gap: 4px;
    padding: 8px 6px;
    border-radius: 36px;
    & > svg {
      width: 15.43px;
      height: 15.43px;
    }
  `,
  mobile: css`
    gap: ${theme.scales.paddings.base}px;
    padding: 8px ${theme.containers.paddings.secondary}px;
    background: ${theme.buttons.secondary.low.rest};
    border-radius: ${theme.scales.cornerRadius.m}px;

    & > svg {
      width: 27px;
      height: 27px;
    }
  `,
  "mobile-compact": css`
    gap: ${theme.scales.paddings.base}px;
    padding: ${theme.scales.paddings.m}px
      ${theme.containers.paddings.secondary}px;
    background: ${theme.buttons.secondary.low.rest};
    border-radius: 8px;

    & > svg {
      width: 27px;
      height: 27px;
    }
  `,
}))

export type SChainSelectProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: ChainSelectVariant
  readonly isActive?: boolean
}

export const SChainSelect = styled.button<SChainSelectProps>(
  ({ theme, variant = "desktop", isActive }) => [
    css`
      display: flex;
      align-items: center;

      color: ${variant === "mobile" && !isActive
        ? theme.text.low
        : theme.text.high};

      cursor: pointer;

      ${isActive &&
      css`
        background: #85d1ff33;
        border: 1px solid #85d1ff80;
      `}
    `,
    variants(variant),
  ],
)
