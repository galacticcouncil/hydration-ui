import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { CollateralType } from "@/helpers/types"

type CollateralStateProps = {
  collateralType: CollateralType
}

export const CollateralState: React.FC<CollateralStateProps> = ({
  collateralType,
}: CollateralStateProps) => {
  return (
    <Flex inline align="center">
      {
        {
          [CollateralType.ENABLED]: (
            <Text fw={500} color={getToken("accents.success.emphasis")}>
              Enabled
            </Text>
          ),
          [CollateralType.ISOLATED_ENABLED]: (
            <Text fw={500} color={getToken("accents.alert.primary")}>
              Isolated
            </Text>
          ),
          [CollateralType.DISABLED]: (
            <Text fw={500} color={getToken("accents.danger.emphasis")}>
              Disabled
            </Text>
          ),
          [CollateralType.UNAVAILABLE]: (
            <Text fw={500} color={getToken("accents.danger.emphasis")}>
              Unavailable
            </Text>
          ),
          [CollateralType.ISOLATED_DISABLED]: (
            <Text fw={500} color={getToken("accents.danger.emphasis")}>
              Unavailable
            </Text>
          ),
          [CollateralType.UNAVAILABLE_DUE_TO_ISOLATION]: (
            <Text fw={500} color={getToken("accents.danger.emphasis")}>
              Unavailable
            </Text>
          ),
        }[collateralType]
      }
    </Flex>
  )
}
