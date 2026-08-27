import { Flex, FlexProps } from "@/components/Flex"
import { Image } from "@/components/Image"

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
    <Image
      src="/images/platforms/zcash.png"
      alt="Zcash"
      width={size}
      height={size}
    />
  </Flex>
)
