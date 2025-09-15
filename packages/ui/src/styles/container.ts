import { css, SerializedStyles } from "@emotion/react"

import { breakpointsMap, ScreenBreakpoint } from "./media"

export type ContainerQueryType = "size" | "inline-size" | "block-size"

export type ContainerQueryCondition = {
  type: ContainerQueryType
  value: string
}

export type ContainerQueryConfig = {
  name?: string
  conditions: ContainerQueryCondition[]
}

export function containerQuery(
  config: ContainerQueryConfig,
  styles: SerializedStyles | string,
): SerializedStyles {
  const { name, conditions } = config

  const queryParts = conditions.map((condition) => {
    const { type, value } = condition
    return `(${type} >= ${value})`
  })

  const queryString = queryParts.join(" and ")
  const containerName = name ? `container-type: ${name};` : ""

  return css`
    ${containerName}

    @container ${queryString} {
      ${styles}
    }
  `
}

export function containerSize(
  size: ScreenBreakpoint,
  styles: SerializedStyles | string,
  type: ContainerQueryType = "inline-size",
): SerializedStyles {
  const value = breakpointsMap[size]

  return containerQuery(
    {
      conditions: [{ type, value }],
    },
    styles,
  )
}
