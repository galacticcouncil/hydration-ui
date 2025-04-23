import { forwardRef } from "react"

import { BoxProps } from "@/components/Box"
import { SPaper } from "@/components/Paper/Paper.styled"

export type PaperProps = BoxProps & {
  variant?: "plain" | "bordered"
}

export const Paper: React.FC<PaperProps> = forwardRef<HTMLElement, PaperProps>(
  ({ borderRadius = "xl", ...props }, ref) => {
    return <SPaper ref={ref} borderRadius={borderRadius} {...props} />
  },
)

Paper.displayName = "Paper"
