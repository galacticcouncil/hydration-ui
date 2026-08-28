import { Flex, FlexProps } from "@/components/Flex"
import { Image } from "@/components/Image"

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
    <Image
      src="/images/platforms/near.png"
      alt="NEAR"
      width={size}
      height={size}
    />
  </Flex>
)
