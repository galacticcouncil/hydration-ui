import { FC, Ref } from "react"

import { BoxProps } from "@/components/Box"
import { SPaper } from "@/components/Paper/Paper.styled"

export type PaperProps = BoxProps & {
  variant?: "plain" | "bordered"
}

export const Paper: FC<PaperProps & { ref?: Ref<HTMLElement> }> = ({
  borderRadius = "xl",
  ref,
  ...props
}) => {
  return <SPaper ref={ref} borderRadius={borderRadius} {...props} />
}
