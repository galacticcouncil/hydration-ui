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
      src="https://s2.coinmarketcap.com/static/img/coins/64x64/1437.png"
      alt="Zcash"
      width={size}
      height={size}
    />
  </Flex>
)
