import { FC } from "react"
import { GigadotOverview } from "sections/wallet/strategy/GigadotOverview/GidadotOverview"
import {
  SGigadotStrategy,
  SGigadotStrategySeparator,
} from "sections/wallet/strategy/GigadotStrategy/GigadotStrategy.styled"
import { NewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm"
import { useStrategyData } from "sections/wallet/strategy/GigadotStrategy/GigadotStrategy.data"
import { GigadotStrategyBackgroundEffect } from "sections/wallet/strategy/BackgroundEffect/GigadotStrategyBackgroundEffect"
import {
  GIGADOT_ASSET_ID,
  GIGADOT_DEPOSIT,
} from "sections/wallet/strategy/strategy.mock"
import { CurrentDeposit } from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit"
import { Separator } from "components/Separator/Separator"
import { CurrentDepositReadMore } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositReadMore"
import { CurrentDepositEmptyState } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositEmptyState"

export const GigadotStrategy: FC = () => {
  const { apr, tvl } = useStrategyData(GIGADOT_ASSET_ID)

  return (
    <SGigadotStrategy>
      <GigadotStrategyBackgroundEffect />
      <div sx={{ flex: "column", gap: [20, 30] }}>
        <GigadotOverview riskLevel="low" apr={apr} tvl={tvl} />
        <Separator />
        {GIGADOT_DEPOSIT ? (
          <>
            <CurrentDeposit depositData={GIGADOT_DEPOSIT} />
            <div sx={{ display: ["none", "contents"] }}>
              <Separator />
              <CurrentDepositReadMore />
            </div>
          </>
        ) : (
          <CurrentDepositEmptyState />
        )}
      </div>
      <GigadotStrategySeparator />
      <NewDepositForm depositData={GIGADOT_DEPOSIT} />
    </SGigadotStrategy>
  )
}

const GigadotStrategySeparator: FC = () => {
  return (
    <>
      <SGigadotStrategySeparator
        orientation="vertical"
        sx={{ display: ["none", "initial"] }}
      />
      <SGigadotStrategySeparator
        orientation="horizontal"
        sx={{ display: ["initial", "none"] }}
      />
    </>
  )
}
