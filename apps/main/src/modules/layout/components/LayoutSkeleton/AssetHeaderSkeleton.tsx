import {
  Flex,
  FlexProps,
  LogoSkeleton,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

export const AssetHeaderSkeleton: React.FC<FlexProps> = (props) => {
  return (
    <Flex gap="base" align="center" {...props}>
      <LogoSkeleton size="large" />
      <Stack>
        <Text fs="h7" lh={1} fw={600} font="primary">
          <Skeleton width={100} />
        </Text>
        <Text fs="p6" color={getToken("text.medium")}>
          <Skeleton width={40} />
        </Text>
      </Stack>
    </Flex>
  )
}
