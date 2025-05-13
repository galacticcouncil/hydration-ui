import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import { Tooltip } from "@galacticcouncil/ui/components"

export const ApprovalTooltip = () => (
  <Tooltip
    text={
      <>
        To continue, you need to grant Hydration smart contracts permission to
        move your funds from your wallet. Depending on the asset and wallet you
        use, it is done by signing the permission message (gas free), or by
        submitting an approval transaction (requires gas).
      </>
    }
  >
    <CircleInfo />
  </Tooltip>
)
