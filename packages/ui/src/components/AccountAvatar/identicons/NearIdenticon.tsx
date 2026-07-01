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
      src="https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png"
      alt="NEAR"
      width={size}
      height={size}
    />
  </Flex>
)
