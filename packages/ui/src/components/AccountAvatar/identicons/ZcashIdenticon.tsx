import { METADATA_CDN_URL } from "@galacticcouncil/utils"

import { Flex, FlexProps } from "@/components/Flex"
import { Image } from "@/components/Image"

const ICON_URL = `${METADATA_CDN_URL}/v2/zcash/zec/icon.svg`

export type ZcashIdenticonProps = Omit<FlexProps, "size"> & {
  size: number
}

export const ZcashIdenticon: React.FC<ZcashIdenticonProps> = ({
  size,
  ...props
}) => (
  <Flex
    size={size}
    borderRadius="full"
    align="center"
    justify="center"
    sx={{ overflow: "hidden" }}
    {...props}
  >
    <Image src={ICON_URL} alt="Zcash" width={size} height={size} />
  </Flex>
)
