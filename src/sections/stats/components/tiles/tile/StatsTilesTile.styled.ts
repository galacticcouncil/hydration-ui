import styled from "@emotion/styled"
import { Link } from "@tanstack/react-location"
import { ButtonTransparent } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"

export const TILE_COLOR = {
  red: "#ff014d",
  blue: "#0176ff",
  cyan: "#0084ae",
  purple: "#9e01ff",
}

export const SContainer = styled(ButtonTransparent)<{
  variant: keyof typeof TILE_COLOR
}>`
  position: relative;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;

  min-height: 160px;
  height: min-content;

  padding: 16px 14px;
  text-align: start;

  background: radial-gradient(
      200% 200% at 30% 150%,
      ${({ variant }) => TILE_COLOR[variant]} 0%,
      transparent 100%
    )
    rgba(19, 18, 47, 0.52);

  border-radius: 4px;
`

export const STitle = styled(Text)`
  display: inline-block;
  width: 75%;

  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  color: ${theme.colors.white};
`

export const SDescription = styled(Text)`
  font-size: 14px;
  line-height: 18px;
  color: ${theme.colors.white};
`

export const SIcon = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;

  color: rgba(${theme.rgbColors.white}, 0.4);
`

export const SLink = styled(Link)`
  font-weight: 500;
  color: ${theme.colors.white};

  border-bottom: 1px solid white;
  transition: all 0.15s ease-in-out;

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 10px;
    height: 10px;
    margin-left: 4px;
  }
`
