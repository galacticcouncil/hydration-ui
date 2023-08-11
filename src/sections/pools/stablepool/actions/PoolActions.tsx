import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { ReactComponent as PlusIcon } from "assets/icons/PlusIcon.svg"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SActionsContainer, SButtonOpen } from 'sections/pools/pool/actions/PoolActions.styled'
import { useAccountStore } from "state/store"
import { TransferModal } from "../transfer/TransferModal"
import { AssetMetaById, BalanceByAsset } from "../../PoolsPage.utils"
import { u32 } from "@polkadot/types-codec"
import BigNumber from "bignumber.js"
import { useMedia } from 'react-use'
import { theme } from 'theme'
import { LiquidityPositions } from '../../modals/LiquidityPositions/LiquidityPositions'
import { ReactComponent as DetailsIcon } from "assets/icons/DetailsIcon.svg"

type PoolActionsProps = {
  poolId: u32
  tradeFee: BigNumber
  balanceByAsset?: BalanceByAsset
  assetMetaById?: AssetMetaById
  className?: string
  onExpandClick: () => void
  isExpanded: boolean;
  canExpand?: boolean;
}

export const PoolActions = ({
  poolId,
  className,
  balanceByAsset,
  assetMetaById,
  tradeFee,
  onExpandClick,
  isExpanded,
  canExpand
}: PoolActionsProps) => {
  const { t } = useTranslation()
  const [openAdd, setOpenAdd] = useState(false)
  const { account } = useAccountStore()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [openLiquidityPositions, setOpenLiquidityPositions] = useState(false)

  const actionButtons = (
    <div sx={{ flexGrow: 1 }}>
      <div sx={{ flex: ["row", "column"], gap: 10, flexGrow: 1 }}>
        <Button
          fullWidth
          size="small"
          disabled={!account || account.isExternalWalletConnected}
          onClick={() => setOpenAdd(true)}
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
            disabled={!account}
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
      {openLiquidityPositions && !isDesktop && (
        <LiquidityPositions
          isOpen={openLiquidityPositions}
          onClose={() => setOpenLiquidityPositions(false)}
          pool={{} as any}
        />
      )}
      {openAdd && (
        <TransferModal
          poolId={poolId}
          tradeFee={tradeFee}
          isOpen={openAdd}
          onClose={() => setOpenAdd(false)}
          balanceByAsset={balanceByAsset}
          assetMetaById={assetMetaById}
        />
      )}
    </>
  )
}
