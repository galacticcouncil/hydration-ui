import { METADATA_CDN_URL } from "@galacticcouncil/utils"

import { Flex, FlexProps } from "@/components/Flex"
import { Image } from "@/components/Image"

const ICON_URL = `${METADATA_CDN_URL}/v2/solana/101/assets/SOL/icon.svg`

export type SolanaIdenticonProps = Omit<FlexProps, "size"> & {
  size: number
}

export const SolanaIdenticon: React.FC<SolanaIdenticonProps> = ({
  size,
  ...props
}) => (
  <Flex
    size={size}
    borderRadius="full"
    align="center"
    justify="center"
    {...props}
  >
    <Image src={ICON_URL} alt="Solana" width={size} height={size} />
  </Flex>
)
