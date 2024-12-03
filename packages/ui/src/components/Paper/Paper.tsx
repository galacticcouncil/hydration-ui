import { BoxProps } from "@/components/Box"
import { SPaper } from "@/components/Paper/Paper.styled"

export type PaperProps = {
  variant?: "plain" | "bordered"
} & BoxProps

export const Paper: React.FC<PaperProps> = (props) => {
  return <SPaper {...props} />
}
