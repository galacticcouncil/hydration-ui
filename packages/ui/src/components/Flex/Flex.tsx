import { ThemeUICSSProperties, useThemeUI } from "@theme-ui/core"
import { css } from "@theme-ui/css"
import { forwardRef } from "react"

import { Box, BoxProps } from "@/components/Box"

const flexSystemProps = [
  "gap",
  "flexDirection",
  "alignItems",
  "justifyContent",
  "flexWrap",
] as const

const flexSystemPropsAliasMap: Record<
  string,
  (typeof flexSystemProps)[number]
> = {
  direction: "flexDirection",
  align: "alignItems",
  justify: "justifyContent",
  wrap: "flexWrap",
}

const flexSystemPropsAliases = Object.keys(
  flexSystemPropsAliasMap,
) as (keyof typeof flexSystemPropsAliasMap)[]

const flexSystemPropsWithAliases = [
  ...flexSystemProps,
  ...flexSystemPropsAliases,
]

type FlexSystemPropsKeys = (typeof flexSystemProps)[number]
type FlexSystemProps = Pick<ThemeUICSSProperties, FlexSystemPropsKeys>

export type FlexOwnProps = {
  direction?: FlexSystemProps["flexDirection"]
  align?: FlexSystemProps["alignItems"]
  justify?: FlexSystemProps["justifyContent"]
  inline?: boolean
}

export type FlexProps = FlexOwnProps & FlexSystemProps & BoxProps

const pickSystemProps = (props: FlexSystemProps) => {
  const res: Partial<Pick<FlexSystemProps, (typeof flexSystemProps)[number]>> =
    {}

  for (const key of flexSystemPropsWithAliases) {
    const aliasKey = flexSystemPropsAliasMap[key] || key
    // @ts-expect-error ts2590: union is too large
    res[aliasKey] = props[key]
  }

  return res
}

export const Flex = forwardRef<HTMLElement, FlexProps>(
  (props: FlexProps, ref) => {
    const { theme } = useThemeUI()
    const { css: cssProp, sx, ...rest } = props

    const systemStyles = css(pickSystemProps(rest))(theme)

    flexSystemPropsWithAliases.forEach((name) => {
      delete (rest as Record<string, unknown>)[name]
    })

    return (
      <Box
        ref={ref}
        {...rest}
        css={[cssProp, systemStyles]}
        sx={{
          display: props.inline ? "inline-flex" : "flex",
          ...sx,
        }}
      />
    )
  },
)

Flex.displayName = "Flex"
