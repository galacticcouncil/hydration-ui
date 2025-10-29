import { ResponsiveStyleValue } from "@theme-ui/css"
import React from "react"
import { isArray } from "remeda"

import { Flex, FlexProps } from "@/components/Flex"
import { Separator, SeparatorProps } from "@/components/Separator"

type StackDirection = "row" | "column"

export type StackProps = Omit<FlexProps, "direction"> & {
  separated?: boolean
  withTrailingSeparator?: boolean
  separator?: React.ReactElement<Partial<SeparatorProps>>
  direction?: ResponsiveStyleValue<StackDirection>
  children: React.ReactNode
}

export const Stack: React.FC<StackProps> = ({
  separated = false,
  withTrailingSeparator = false,
  separator,
  direction = "column",
  justify = "space-between",
  children,
  ...props
}) => (
  <Flex direction={direction} justify={justify} {...props}>
    {separated
      ? joinChildren(
          children,
          React.isValidElement(separator) ? (
            React.cloneElement(separator, {
              orientation: directionToSeparatorOrientation(direction),
            })
          ) : (
            <Separator
              orientation={directionToSeparatorOrientation(direction)}
              sx={{ flexShrink: 0 }}
            />
          ),
          withTrailingSeparator,
        )
      : children}
  </Flex>
)

function directionToSeparatorOrientation(
  direction: StackProps["direction"],
): SeparatorProps["orientation"] {
  const map = {
    column: "horizontal",
    row: "vertical",
  } as const

  if (isArray(direction)) return direction.map((d) => (d ? map[d] : null))
  return direction ? map[direction] : null
}

function joinChildren(
  children: React.ReactNode,
  separator: React.ReactElement<unknown>,
  withTrailingSeparator = false,
): React.ReactNode[] {
  const childrenArray = React.Children.toArray(children).filter(Boolean)

  return childrenArray.reduce<React.ReactNode[]>((output, child, index) => {
    output.push(child)

    const isLast = index === childrenArray.length - 1
    if (!isLast || withTrailingSeparator) {
      output.push(React.cloneElement(separator, { key: `separator-${index}` }))
    }

    return output
  }, [])
}
