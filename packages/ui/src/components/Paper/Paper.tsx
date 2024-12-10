import { BoxProps } from "@/components/Box"
import { SPaper } from "@/components/Paper/Paper.styled"

export type PaperProps = BoxProps & {
  variant?: "plain" | "bordered"
}

export const Paper: React.FC<PaperProps> = ({
  borderRadius = "xl",
  ...props
}) => {
  return <SPaper borderRadius={borderRadius} {...props} />
}
