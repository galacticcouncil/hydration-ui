import ChevronDown from "assets/icons/ChevronDown.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"
import {
  SActionsContainer,
  SButtonOpen,
} from "sections/pools/pool/actions/PoolActions.styled"
import { useAccountStore } from "state/store"
import { u32 } from "@polkadot/types-codec"
import BigNumber from "bignumber.js"
import { useMedia } from "react-use"
import { theme } from "theme"
import { LiquidityPositionButton } from "sections/pools/stablepool/positions/LiquidityPositionButton"
import { TAsset } from "api/assetDetails"
import { OmnipoolPool, Stablepool } from "sections/pools/PoolsPage.utils"

type PoolActionsProps = {
  poolId: u32
  pool: Stablepool | OmnipoolPool
  assets: TAsset[]
  fee: BigNumber
  className?: string
  onExpandClick: () => void
  isExpanded: boolean
  canExpand?: boolean
  refetchPositions: () => void
  reserves: { asset_id: number; amount: string }[]
  amount: BigNumber
  onTransferOpen: () => void
}

export const PoolActions = ({
  poolId,
  pool,
  className,
  fee,
  onExpandClick,
  isExpanded,
  canExpand,
  refetchPositions,
  assets,
  reserves,
  amount,
  onTransferOpen,
}: PoolActionsProps) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const actionButtons = (
    <div sx={{ flexGrow: 1 }}>
      <div sx={{ flex: ["row", "column"], gap: 10, flexGrow: 1 }}>
        <Button
          fullWidth
          size="small"
          disabled={!account || account.isExternalWalletConnected}
          onClick={onTransferOpen}
        >
          <div sx={{ flex: "row", align: "center", justify: "center" }}>
            <Icon icon={<PlusIcon />} sx={{ mr: 8, height: 16 }} />
            {t("liquidity.asset.actions.addLiquidity")}
          </div>
        </Button>
        {!isDesktop && (
          <LiquidityPositionButton
            poolId={poolId}
            pool={pool}
            assets={assets}
            reserves={reserves}
            amount={amount}
            fee={fee}
            refetchPosition={refetchPositions}
            onTransferOpen={onTransferOpen}
          />
        )}
      </div>
    </div>
  )

  return (
    <SActionsContainer className={className}>
      {actionButtons}
      {isDesktop && (
        <SButtonOpen
          name="Expand"
          icon={<ChevronDown />}
          isActive={isExpanded}
          onClick={onExpandClick}
          disabled={!account || !canExpand}
        />
      )}
    </SActionsContainer>
  )
}
