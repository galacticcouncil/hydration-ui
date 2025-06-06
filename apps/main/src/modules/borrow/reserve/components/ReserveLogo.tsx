import { Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { Logo } from "@/components/Logo"

export type ReserveLogoProps = {
  assetId: string
  name: string
  symbol: string
}

export const ReserveLogo: React.FC<ReserveLogoProps> = ({
  assetId,
  name,
  symbol,
}) => {
  return (
    <Flex gap={8}>
      <Logo id={assetId} size="large" />
      <Stack>
        <Text fs="h7" lh={1} fw={600} font="primary">
          {name}
        </Text>
        <Text fs="p6" color={getToken("text.medium")}>
          {symbol}
        </Text>
      </Stack>
    </Flex>
  )
}
