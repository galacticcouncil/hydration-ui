import styled from "@emotion/styled"
import { gradientBorder, theme } from "theme"

export const SContainer = styled.div<{ variant: string }>`
  width: 100%;
  flex: 1;

  position: relative;

  display: flex;
  flex-direction: column;

  background-color: rgba(6, 9, 23, 0.4);

  ${gradientBorder};
  border-radius: ${theme.borderRadius.stakingCard}px;
  :before {
    border-radius: ${theme.borderRadius.stakingCard}px;
  }

  ${({ variant }) => {
    if (variant === "primary") {
      return `

        background: linear-gradient(
          0deg,
          rgba(255, 97, 144, 0.22) -0.13%,
          rgba(73, 105, 132, 0.02) 101.13%,
          rgba(132, 73, 91, 0.02) 101.13%
        ), rgba(67, 22, 43, 0.7);

        :before {
          background: linear-gradient(
            180deg,
            rgba(214, 152, 185, 0.41) 0%,
            rgba(199, 163, 176, 0.15) 66.67%,
            rgba(91, 151, 245, 0) 99.99%,
            rgba(158, 167, 180, 0) 100%
          );
        }
      `
    }

    if (variant === "secondary") {
      return `background: linear-gradient(0deg, rgba(44, 150, 239, 0.20) -142.91%, rgba(73, 105, 132, 0.03) 117%)`
    }

    if (variant === "green") {
      return "background: linear-gradient(0deg, rgba(97, 255, 246, 0.22) -0.13%, rgba(73, 105, 132, 0.02) 101.13%, rgba(73, 128, 132, 0.02) 101.13%), rgba(22, 67, 53, 0.70)"
    }
  }}
`

export const SHeader = styled.div<{ variant: string }>`
  padding: 20px 24px;

  display: flex;
  align-items: center;
  gap: 12px;

  border-bottom: 1px solid rgba(${theme.rgbColors.white}, 0.12);

  ${({ variant }) =>
    `border-bottom: 1px solid ${variant === "primary" ? "#55394e" : "202135"};`}
`
