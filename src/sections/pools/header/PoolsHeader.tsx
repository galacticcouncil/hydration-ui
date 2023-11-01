import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Fragment, ReactElement } from "react"
import Skeleton from "react-loading-skeleton"
import { useRpcProvider } from "providers/rpcProvider"

export const HeaderSeparator = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  return (
    <Separator
      sx={{
        mb: [15, 0],
        height: ["1px", "40px"],
      }}
      css={{ background: `rgba(${theme.rgbColors.white}, 0.12)` }}
      orientation={isDesktop ? "vertical" : "horizontal"}
    />
  )
}

export const HeaderValues = ({
  values,
  skeletonHeight,
}: {
  skeletonHeight?: [number, number]
  values: Array<{
    label?: string
    content: ReactElement
    hidden?: boolean
    disconnected?: boolean
    withoutSeparator?: boolean
    initiallyHidden?: boolean
  }>
}) => {
  const { isLoaded } = useRpcProvider()

  const headerValues = values.reduce((acc, item, i, array) => {
    const isLastElement = i + 1 === array.length

    if (!isLoaded && item.initiallyHidden) return acc

    const content =
      isLoaded && !item.disconnected ? (
        item.content
      ) : (
        <Skeleton
          sx={{ height: skeletonHeight ?? [19, 28], width: [180, 200] }}
          enableAnimation={!item.disconnected}
        />
      )

    if (!item.hidden) {
      acc.push(
        item.label ? (
          <div
            key={`${i}_content`}
            sx={{ flex: ["row", "column"], justify: "space-between" }}
          >
            <Text color="brightBlue300" sx={{ mb: 6 }}>
              {item.label}
            </Text>
            {content}
          </div>
        ) : (
          <Fragment key={`${i}_content`}>{content}</Fragment>
        ),
      )

      if (!isLastElement && !item.withoutSeparator)
        acc.push(<HeaderSeparator key={`${i}_separator`} />)
    }

    return acc
  }, [] as ReactElement[])

  return (
    <div
      sx={{
        flex: ["column", "row"],
        mb: 40,
        flexWrap: "wrap",
        gap: [12, 0],
        align: ["normal", "center"],
        justify: "space-between",
      }}
    >
      {headerValues}
    </div>
  )
}
