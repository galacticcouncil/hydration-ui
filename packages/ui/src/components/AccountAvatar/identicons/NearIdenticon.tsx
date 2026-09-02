import { METADATA_CDN_URL } from "@galacticcouncil/utils"

import { Flex, FlexProps } from "@/components/Flex"
import { Image } from "@/components/Image"

const ICON_URL = `${METADATA_CDN_URL}/v2/near/near/icon.svg`

export type NearIdenticonProps = Omit<FlexProps, "size"> & {
  size: number
}

export const NearIdenticon: React.FC<NearIdenticonProps> = ({
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
    <Image src={ICON_URL} alt="NEAR" width={size} height={size} />
  </Flex>
)
