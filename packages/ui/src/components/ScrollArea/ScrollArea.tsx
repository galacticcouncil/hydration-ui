import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { ThemeUICSSProperties } from "@theme-ui/css"
import { forwardRef } from "react"

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
}

const ScrollArea = forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(
  (
    {
      children,
      height,
      width,
      viewportRef,
      orientation = "vertical",
      ...props
    },
    ref,
  ) => (
    <SRoot {...props} ref={ref} sx={{ height, width }}>
      <SViewport ref={viewportRef}>{children}</SViewport>
      <ScrollBar orientation={orientation} />
      <ScrollAreaPrimitive.Corner />
    </SRoot>
  ),
)
ScrollArea.displayName = "ScrollArea"

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
