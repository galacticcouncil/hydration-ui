import { FC, Ref } from "react"

import { Chip } from "@/components"

export const PriceIndicator: FC<
  React.ComponentPropsWithRef<typeof Chip> & { ref?: Ref<HTMLDivElement> }
> = ({ ref, ...props }) => {
  return (
    <Chip
      ref={ref}
      variant="tertiary"
      rounded
      sx={{ position: "absolute", zIndex: 2, fontWeight: 600, lineHeight: 1.4 }}
      {...props}
    />
  )
}
