import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { ReactComponent as DetailsIcon } from "assets/icons/DetailsIcon.svg"
import { ReactComponent as PlusIcon } from "assets/icons/PlusIcon.svg"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { AddLiquidity } from "sections/pools/modals/AddLiquidity/AddLiquidity"
import {
  SActionsContainer,
  SButtonOpen,
} from "sections/pools/pool/actions/PoolActions.styled"
import { useAccountStore } from "state/store"
import { theme } from "theme"
import { LiquidityPositions } from "../../modals/LiquidityPositions/LiquidityPositions"
import { usePoolPositions } from "../Pool.utils"

type PoolActionsProps = {
  pool: OmnipoolPool
  canExpand: boolean
  isExpanded: boolean
  onExpandClick: () => void
  refetch: () => void
  className?: string
}

export const PoolActions = ({
  pool,
  className,
  canExpand,
  isExpanded,
  onExpandClick,
  refetch,
}: PoolActionsProps) => {
  const { t } = useTranslation()
  const [openAdd, setOpenAdd] = useState(false)
  const [openLiquidityPositions, setOpenLiquidityPositions] = useState(false)
  const { account } = useAccountStore()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const positions = usePoolPositions(pool)

  const actionButtons = (
    <div sx={{ flex: ["row", "column"], gap: 10, flexGrow: 1 }}>
      <Button
        fullWidth
        size="small"
        disabled={!account || account.isExternalWalletConnected}
        onClick={() => {
          setOpenAdd(true)
        }}
      >
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<PlusIcon />} sx={{ mr: 8, height: 16 }} />
          {t("liquidity.asset.actions.addLiquidity")}
        </div>
      </Button>
      {!isDesktop && (
        <Button
          fullWidth
          size="small"
          disabled={!account || !positions.data.length}
          onClick={() => {
            setOpenLiquidityPositions(true)
          }}
        >
          <div sx={{ flex: "row", align: "center", justify: "center" }}>
            <Icon icon={<DetailsIcon />} sx={{ mr: 8, height: 16 }} />
            {t("liquidity.asset.actions.myPositions")}
          </div>
        </Button>
      )}
    </div>
  )

  return (
    <>
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
      {openAdd && (
        <AddLiquidity
          isOpen={openAdd}
          onClose={() => setOpenAdd(false)}
          pool={pool}
          onSuccess={refetch}
        />
      )}
      {openLiquidityPositions && !isDesktop && (
        <LiquidityPositions
          isOpen={openLiquidityPositions}
          onClose={() => setOpenLiquidityPositions(false)}
          pool={pool}
        />
      )}
    </>
  )
}
