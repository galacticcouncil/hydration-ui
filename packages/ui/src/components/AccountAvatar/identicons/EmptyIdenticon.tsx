import { UserIcon } from "lucide-react"

import { Flex, FlexProps } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import { getToken } from "@/utils"

export type EmptyIdenticonProps = Omit<FlexProps, "size"> & {
  size: number
}

export const EmptyIdenticon: React.FC<EmptyIdenticonProps> = ({
  size,
  ...props
}) => (
  <Flex
    size={size}
    bg={getToken("controls.dim.accent")}
    borderRadius="full"
    align="center"
    justify="center"
    {...props}
  >
    <Icon
      sx={{ width: "60%", height: "60%" }}
      component={UserIcon}
      color={getToken("text.low")}
    />
  </Flex>
)
