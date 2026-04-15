import { Box } from "@/components/Box"
import { SExpanderRoot } from "@/components/Expander/Expander.styled"

export type ExpanderProps = {
  className?: string
  children: React.ReactNode
  expanded: boolean
  duration?: number
}

export const Expander: React.FC<ExpanderProps> = ({
  className,
  children,
  expanded,
  duration = 300,
}) => {
  return (
    <SExpanderRoot
      className={className}
      duration={duration}
      expanded={expanded}
    >
      <Box>{children}</Box>
    </SExpanderRoot>
  )
}
