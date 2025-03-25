import { forwardRef } from "react"

import { Chip } from "@/components"

export const PriceIndicator = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<typeof Chip>
>((props, ref) => {
  return (
    <Chip
      ref={ref}
      variant="tertiary"
      rounded
      sx={{ position: "absolute", zIndex: 2 }}
      {...props}
    />
  )
})
PriceIndicator.displayName = "PriceIndicator"
