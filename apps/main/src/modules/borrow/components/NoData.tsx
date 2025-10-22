import { Minus } from "@galacticcouncil/ui/assets/icons"
import { Icon } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

type NoDataProps = Omit<
  React.ComponentPropsWithRef<typeof Icon>,
  "component" | "color"
>

export const NoData: React.FC<NoDataProps> = ({ size = 16, ...props }) => {
  return (
    <Icon
      display="inline-flex"
      color={getToken("text.low")}
      component={Minus}
      size={size}
      {...props}
    />
  )
}
