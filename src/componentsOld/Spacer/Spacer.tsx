import styled from "@emotion/styled"
import isPropValid from "@emotion/is-prop-valid"
import { getResponsiveStyles, ResponsiveValue } from "utils/responsive"

export const Spacer = styled("span", {
  shouldForwardProp: (prop) => isPropValid(prop as string) && prop !== "size",
})<{
  size: ResponsiveValue<number | string>
  axis?: ResponsiveValue<"horizontal" | "vertical">
}>`
  display: block;

  ${({ size: cssSize, axis }) =>
    getResponsiveStyles(cssSize, (value) => {
      return (
        getResponsiveStyles(axis, {
          horizontal: {
            width: value,
            minWidth: value,
            height: 1,
            minHeight: 1,
          },
          vertical: {
            width: 1,
            minWidth: 1,
            height: value,
            minHeight: value,
          },
        }) ?? {
          width: value,
          minWidth: value,
          height: value,
          minHeight: value,
        }
      )
    })}
`
