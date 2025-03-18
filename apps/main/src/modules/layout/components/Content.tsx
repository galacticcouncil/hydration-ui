import { BoxProps } from "@galacticcouncil/ui/components"

import { SContent } from "@/modules/layout/components/Content.styled"

export const Content: React.FC<BoxProps> = ({ ...props }) => {
  return <SContent {...props} />
}
