import ChevronDown from "assets/icons/ChevronDown.svg?react"
import DetailsIcon from "assets/icons/DetailsIcon.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import FarmDetailsIcon from "assets/icons/FarmDetailsIcon.svg?react"
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
import { LiquidityPositions } from "sections/pools/modals/LiquidityPositions/LiquidityPositions"
import { usePoolPositions } from "sections/pools/pool/Pool.utils"
import { useFarms } from "api/farms"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { Text } from "components/Typography/Text/Text"
import { useAccountDeposits } from "api/deposits"

type PoolActionsProps = {
  pool: OmnipoolPool
  canExpand: boolean
  isExpanded: boolean
  onExpandClick: () => void
  refetch: () => void
  className?: string
}
const enabledFarms = import.meta.env.VITE_FF_FARMS_ENABLED === "true"

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
  const [openFarmDefails, setOpenFarmDefails] = useState(false)
  const { account } = useAccountStore()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const positions = usePoolPositions(pool.id)
  const farms = useFarms([pool.id])
  const accountDeposits = useAccountDeposits(enabledFarms ? pool.id : undefined)

  const actionButtons = (
    <div sx={{ flexGrow: 1 }}>
      <div sx={{ flex: ["row", "column"], gap: 10, flexGrow: 1 }}>
        <Button
          fullWidth
          size="small"
          disabled={
            !account ||
            account.isExternalWalletConnected ||
            !pool.tradability.canAddLiquidity
          }
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
            disabled={
              !account ||
              !(positions.data.length || accountDeposits.data?.length)
            }
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
        {farms.data?.length && isDesktop ? (
          <Button
            fullWidth
            size="small"
            onClick={() => setOpenFarmDefails(true)}
          >
            <div sx={{ flex: "row", align: "center", justify: "center" }}>
              <Icon icon={<FarmDetailsIcon />} sx={{ mr: 8, height: 16 }} />
              {t("liquidity.asset.actions.farmDetails", {
                count: farms.data.length,
              })}
            </div>
          </Button>
        ) : null}
      </div>
      {farms.data?.length && !isDesktop ? (
        <div
          role="button"
          sx={{ flex: "row", align: "center", justify: "center", mt: 16 }}
          onClick={() => setOpenFarmDefails(true)}
        >
          <Text color="brightBlue300" fs={12} tTransform="uppercase">
            {t("liquidity.asset.actions.farmDetails", {
              count: farms.data.length,
            })}
          </Text>
          <Icon
            icon={<ChevronDown />}
            sx={{ mr: 8, height: 16, color: "brightBlue300" }}
            css={{ rotate: "270deg" }}
          />
        </div>
      ) : null}
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
          poolId={pool.id}
          onSuccess={refetch}
        />
      )}
      {openLiquidityPositions && !isDesktop && (
        <LiquidityPositions
          isOpen={openLiquidityPositions}
          onClose={() => setOpenLiquidityPositions(false)}
          poolId={pool.id}
          canRemoveLiquidity={pool.tradability.canRemoveLiquidity}
        />
      )}
      {openFarmDefails && farms.data && (
        <JoinFarmModal
          farms={farms.data}
          isOpen={openFarmDefails}
          poolId={pool.id}
          onClose={() => setOpenFarmDefails(false)}
        />
      )}
    </>
  )
}
