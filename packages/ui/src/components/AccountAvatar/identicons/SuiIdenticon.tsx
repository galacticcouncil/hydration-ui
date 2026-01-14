import { Flex, FlexProps } from "@/components/Flex"
import { Image } from "@/components/Image"

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
    <Image
      src="https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/sui/0x35834a8a/icon.svg"
      alt="Sui"
      width={size}
      height={size}
    />
  </Flex>
)
