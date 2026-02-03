import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { ResponsiveStyleValue, ThemeUICSSProperties } from "@theme-ui/css"
import { FC, Ref } from "react"

import { useResponsiveValue } from "@/styles/media"
import { ThemeBaseProps } from "@/theme"
import { getSpacingValue } from "@/utils"

import { SRoot, SScrollbar, SThumb, SViewport } from "./ScrollArea.styled"

type ScrollbarOrientation = React.ComponentProps<
  typeof ScrollAreaPrimitive.Scrollbar
>["orientation"]

export type ScrollAreaProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> & {
  height?: ThemeUICSSProperties["height"]
  width?: ThemeUICSSProperties["width"]
  orientation?: ScrollbarOrientation
  viewportRef?: React.Ref<HTMLDivElement>
  horizontalEdgeOffset?: ResponsiveStyleValue<
    number | string | keyof ThemeBaseProps["space"]
  >
  ref?: Ref<React.ElementRef<typeof ScrollAreaPrimitive.Root>>
}

const ScrollArea: FC<ScrollAreaProps> = ({
  children,
  height,
  width,
  viewportRef,
  orientation = "vertical",
  ref,
  horizontalEdgeOffset,
  ...props
}) => {
  const offset = useResponsiveValue(horizontalEdgeOffset, 0)

  return (
    <SRoot
      {...props}
      ref={ref}
      sx={{ height, width }}
      data-orientation={orientation}
      horizontalEdgeOffset={getSpacingValue(offset)}
    >
      <SViewport ref={viewportRef}>{children}</SViewport>
      <ScrollBar orientation={orientation} />
      <ScrollAreaPrimitive.Corner />
    </SRoot>
  )
}

function ScrollBar({
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <SScrollbar orientation={orientation} {...props}>
      <SThumb />
    </SScrollbar>
  )
}
export { ScrollArea, ScrollBar }
