import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Item, ToggleGroupItemProps } from "@radix-ui/react-toggle-group"
import { ItemVariant, ItemSize } from "components/ToggleGroup"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  background: rgba(${theme.rgbColors.alpha0}, 0.06);

  padding: 4px 6px;

  border-radius: ${theme.borderRadius.medium}px;
`

const getVariantStyles = (variant: ItemVariant) => {
  switch (variant) {
    case "primary":
      return css`
        background: ${theme.colors.pink700};
      `
    case "secondary":
      return css`
        background: ${theme.colors.brightBlue700};
      `
  }
}

const getSizeStyles = (size: ItemSize) => {
  switch (size) {
    case "small":
      return css`
        font-size: 13px;
        padding: 8px 20px;
      `
    case "medium":
      return css`
        font-size: 14px;
        padding: 10px 32px;
      `
    case "large":
      return css`
        font-size: 14px;
        padding: 14px 38px;
      `
  }
}

export const SToggleItem = styled(Item)<
  ToggleGroupItemProps & { variant?: ItemVariant; size?: ItemSize }
>`
  all: unset;

  flex: 1;

  white-space: nowrap;
  line-height: 1;
  text-align: center;

  color: rgba(255, 255, 255, 0.7);

  border-radius: 9999px;

  cursor: pointer;

  :hover {
    color: white;
  }

  ${({ size = "medium" }) => getSizeStyles(size)}

  &[data-state="on"] {
    color: white;
    ${({ variant = "primary" }) => getVariantStyles(variant)}
  }

  &[data-disabled] {
    color: rgba(255, 255, 255, 0.3);

    cursor: not-allowed;
    &[data-state="on"] {
      background: rgba(${theme.rgbColors.alpha0}, 0.06);
    }
  }
`
