import { Blend } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon } from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"

export const MultiplyLogo = ({ size }: { size: number }) => (
  <Flex
    inline
    align="center"
    justify="center"
    flex="none"
    size={pxToRem(size)}
    borderRadius="full"
    bg={getToken("tags.soft.purple.background")}
    color={getToken("tags.soft.purple.foreground")}
  >
    <Icon component={Blend} size={size * 0.55} />
  </Flex>
)
