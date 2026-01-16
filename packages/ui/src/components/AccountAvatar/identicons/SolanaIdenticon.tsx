import { Flex, FlexProps } from "@/components/Flex"
import { Image } from "@/components/Image"

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
    <Image
      src="https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/solana/101/assets/SOL/icon.svg"
      alt="Solana"
      width={size}
      height={size}
    />
  </Flex>
)
