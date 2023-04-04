import styled from "@emotion/styled"
import { Icon } from "components/Icon/Icon"
import { theme } from "theme"
import { CardVariant } from "./FarmDetailsCard"
import { css } from "@emotion/react"

export const SContainer = styled.button<{
  variant: CardVariant
  isJoined?: boolean
}>`
  display: grid;
  grid-row-gap: 12px;

  width: 100%;

  padding: 12px;

  border-radius: 4px;
  background-color: rgba(${theme.rgbColors.alpha0}, 0.12);

  transition: all ${theme.transitions.default};

  outline: none;
  border: 1px solid transparent;

  ${({ variant, isJoined }) => {
    if (variant === "div") {
      return css`
        grid-template-columns: 25% 75%;
        grid-template-areas: "tag tag" "apr apr" "details details";

        @media ${theme.viewport.gte.sm} {
          padding: 20px 30px;

          grid-column-gap: 10px;
          grid-template-areas:
            "${isJoined ? "tag" : "apr"} details"
            "apr details";
        }
      `
    }

    return css`
      grid-template-columns: 25% 70% auto;
      grid-template-areas: "tag tag icon" "apr apr icon" "details details icon";

      cursor: pointer;

      @media ${theme.viewport.gte.sm} {
        padding: 20px 30px;

        grid-column-gap: 10px;
        grid-template-areas:
          "${isJoined ? "tag" : "apr"} details icon"
          "apr details icon";
      }

      &:hover {
        border: 1px solid ${theme.colors.brightBlue500};
      }
    `
  }}
`

export const SRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  grid-column-gap: 12px;
  align-items: center;
  justify-content: space-between;

  padding-bottom: 9px;
  margin-bottom: 9px;

  border-bottom: 2px solid rgba(${theme.rgbColors.white}, 0.06);
`

export const SIcon = styled(Icon)`
  transform: rotate(-90deg);
`
