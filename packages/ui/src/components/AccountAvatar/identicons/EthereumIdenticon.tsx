import Jazzicon, { jsNumberForAddress } from "react-jazzicon"

import { Flex, FlexProps } from "@/components/Flex"

export type EthereumIdenticonProps = FlexProps & {
  address: string
  size: number
}

export const EthereumIdenticon: React.FC<EthereumIdenticonProps> = ({
  address,
  size,
  ...props
}) => (
  <Flex {...props}>
    <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />
  </Flex>
)
