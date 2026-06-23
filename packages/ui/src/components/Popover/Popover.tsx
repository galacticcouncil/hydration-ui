import * as PopoverPrimitive from "@radix-ui/react-popover"
import { ComponentProps, FC } from "react"

import {
  PopoverAnimation,
  PopoverTrigger,
  SPopoverContent,
} from "@/components/Popover/Popover.styled"

const Popover = PopoverPrimitive.Root

const PopoverContent: FC<
  ComponentProps<typeof SPopoverContent> & {
    animation?: PopoverAnimation
  }
> = ({ animation, ...props }) => {
  return (
    <PopoverPrimitive.Portal>
      <SPopoverContent sideOffset={20} animation={animation} {...props} />
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverContent, PopoverTrigger }
