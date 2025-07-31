import { Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { TAssetData } from "@/api/assets"
import { Logo } from "@/components/Logo"

type AssetHeaderProps = {
  asset: TAssetData
}

export const AssetHeader: React.FC<AssetHeaderProps> = ({ asset }) => (
  <Flex gap={8}>
    <Logo id={asset.id} size="large" />
    <Stack>
      <Text fs="h7" lh={1} fw={600} font="primary">
        {asset.name}
      </Text>
      <Text fs="p6" color={getToken("text.medium")}>
        {asset.symbol}
      </Text>
    </Stack>
  </Flex>
)
