import { Amount, ResponsiveScope } from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"

import { AssetLogo } from "@/components/AssetLogo"
import {
  SActionsGroup,
  SAmountSection,
  SCancelSection,
  SMobileSeparator,
  SPendingPosition,
  SUnlockSection,
} from "@/components/PendingPosition/PendingPosition.styled"

type PendingPositionProps = {
  assetId: string
  value: string
  displayValue?: string
  isLoading?: boolean
  status?: ReactNode
  action?: ReactNode
}

export const PendingPosition: FC<PendingPositionProps> = ({
  assetId,
  value,
  displayValue,
  isLoading,
  status,
  action,
}) => (
  <ResponsiveScope>
    <SPendingPosition>
      <SAmountSection>
        <AssetLogo id={assetId} />
        <Amount
          value={value}
          displayValue={displayValue}
          isLoading={isLoading}
        />
      </SAmountSection>
      <SMobileSeparator />
      <SActionsGroup>
        <SUnlockSection>{status}</SUnlockSection>
        {action && <SCancelSection>{action}</SCancelSection>}
      </SActionsGroup>
    </SPendingPosition>
  </ResponsiveScope>
)
