import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { CollateralType } from "@/helpers/types"

type CollateralStateProps = {
  collateralType: CollateralType
}

export const CollateralState: React.FC<CollateralStateProps> = ({
  collateralType,
}: CollateralStateProps) => {
  return (
    <div css={{ display: "inline-flex", alignItems: "center" }}>
      {
        {
          [CollateralType.ENABLED]: (
            <Text color={getToken("accents.success.emphasis")}>Enabled</Text>
          ),
          [CollateralType.ISOLATED_ENABLED]: (
            <Text color={getToken("accents.alert.primary")}>Isolated</Text>
          ),
          [CollateralType.DISABLED]: (
            <Text color={getToken("accents.danger.emphasis")}>Disabled</Text>
          ),
          [CollateralType.UNAVAILABLE]: (
            <Text color={getToken("accents.danger.emphasis")}>Unavailable</Text>
          ),
          [CollateralType.ISOLATED_DISABLED]: (
            <Text color={getToken("accents.danger.emphasis")}>Unavailable</Text>
          ),
          [CollateralType.UNAVAILABLE_DUE_TO_ISOLATION]: (
            <Text color={getToken("accents.danger.emphasis")}>Unavailable</Text>
          ),
        }[collateralType]
      }
    </div>
  )
}
