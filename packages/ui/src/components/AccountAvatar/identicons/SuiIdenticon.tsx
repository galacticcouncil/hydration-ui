import { METADATA_CDN_URL } from "@galacticcouncil/utils"

import { Flex, FlexProps } from "@/components/Flex"
import { Image } from "@/components/Image"

const ICON_URL = `${METADATA_CDN_URL}/v2/sui/0x35834a8a/icon.svg`

export type SuiIdenticonProps = Omit<FlexProps, "size"> & {
  size: number
}

export const SuiIdenticon: React.FC<SuiIdenticonProps> = ({
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
    <Image src={ICON_URL} alt="Sui" width={size} height={size} />
  </Flex>
)
