import ChevronDown from "assets/icons/ChevronDown.svg?react"
import DetailsIcon from "assets/icons/DetailsIcon.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import FarmDetailsIcon from "assets/icons/FarmDetailsIcon.svg?react"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import {
  TOmnipoolAsset,
  TXYKPool,
  isXYKPool,
} from "sections/pools/PoolsPage.utils"
import { AddLiquidity } from "sections/pools/modals/AddLiquidity/AddLiquidity"
import {
  SActionsContainer,
  SButtonOpen,
} from "sections/pools/pool/actions/PoolActions.styled"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import { PoolPositionsMobile } from "sections/pools/modals/PoolPositionsMobile/PoolPositionsMobile"
import { useFarms } from "api/farms"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { Text } from "components/Typography/Text/Text"
import {
  Page,
  TransferModal,
} from "sections/pools/stablepool/transfer/TransferModal"

type PoolActionsProps = {
  pool: TOmnipoolAsset | TXYKPool
  canExpand: boolean
  isExpanded: boolean
  onExpandClick: () => void
  className?: string
  refetchPositions: () => void
}

export const PoolActions = ({
  pool,
  className,
  canExpand,
  isExpanded,
  onExpandClick,
  refetchPositions,
}: PoolActionsProps) => {
  const { t } = useTranslation()
  const [openAdd, setOpenAdd] = useState(false)
  const [openLiquidityPositions, setOpenLiquidityPositions] = useState(false)
  const [openFarmDefails, setOpenFarmDetails] = useState(false)
  const [transferOpen, setTransferOpen] = useState<Page>()

  const { account } = useAccount()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const farms = useFarms([pool.id])

  const isXyk = isXYKPool(pool)
  const isStablepool = isXyk ? false : pool.isStablepool

  const actionButtons = (
    <div sx={{ flexGrow: 1 }}>
      <div sx={{ flex: ["row", "column"], gap: 10, flexGrow: 1 }}>
        <Button
          fullWidth
          size="small"
          disabled={
            !account ||
            account.isExternalWalletConnected ||
            !pool.tradability?.canAddLiquidity
          }
          onClick={
            isStablepool
              ? () => setTransferOpen(Page.OPTIONS)
              : () => setOpenAdd(true)
          }
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
            disabled={!account || !canExpand}
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
            onClick={() => setOpenFarmDetails(true)}
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
          onClick={() => setOpenFarmDetails(true)}
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
          pool={pool}
        />
      )}
      {openLiquidityPositions && !isDesktop && (
        <PoolPositionsMobile
          refetchPositions={refetchPositions}
          isOpen
          onClose={() => setOpenLiquidityPositions(false)}
          pool={pool}
        />
      )}
      {openFarmDefails && farms.data && (
        <JoinFarmModal
          farms={farms.data}
          isOpen={openFarmDefails}
          poolId={pool.id}
          onClose={() => setOpenFarmDetails(false)}
        />
      )}
      {transferOpen !== undefined && isStablepool && !isXyk && (
        <TransferModal
          pool={pool}
          isOpen={true}
          defaultPage={transferOpen}
          onClose={() => setTransferOpen(undefined)}
          refetchPositions={refetchPositions}
        />
      )}
    </>
  )
}
