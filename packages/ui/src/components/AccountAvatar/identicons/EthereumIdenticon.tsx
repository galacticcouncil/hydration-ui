import Jazzicon, { jsNumberForAddress } from "react-jazzicon"

import { Box, BoxProps } from "@/components/Box"

export type EthereumIdenticonProps = BoxProps & {
  address: string
  size: number
}

export const EthereumIdenticon: React.FC<EthereumIdenticonProps> = ({
  address,
  size,
  ...props
}) => (
  <Box {...props}>
    <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />
  </Box>
)
