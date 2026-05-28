import { BoxProps } from "@/components/Box"

import { ProseStyleProps, SProse } from "./Prose.styled"

export type ProseProps = BoxProps & ProseStyleProps

export const Prose: React.FC<ProseProps> = ({
  children,
  muted = false,
  size = "medium",
  ...props
}) => {
  return (
    <SProse muted={muted} size={size} {...props}>
      {children}
    </SProse>
  )
}
