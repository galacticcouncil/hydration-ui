import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { ReactComponent as MinusIcon } from "assets/icons/MinusIcon.svg"
import { ReactComponent as PlusIcon } from "assets/icons/PlusIcon.svg"
import { ReactComponent as MoreIcon } from "assets/icons/MoreIcon.svg"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  SActionsContainer,
  SButtonOpen,
} from "sections/pools/pool/actions/PoolActions.styled"
import { useAccountStore } from "state/store"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Modal } from "components/Modal/Modal"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { AddLiquidity } from "sections/pools/modals/AddLiquidity/AddLiquidity"

type PoolActionsProps = {
  pool: OmnipoolPool
  canExpand: boolean
  isExpanded: boolean
  onExpandClick: () => void
  refetch: () => void
}

export const PoolActions = ({
  pool,
  canExpand,
  isExpanded,
  onExpandClick,
  refetch,
}: PoolActionsProps) => {
  const { t } = useTranslation()
  const [openActions, setOpenActions] = useState(false)
  const { account } = useAccountStore()

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const [openAdd, setOpenAdd] = useState(false)

  const closeActionsDrawer = () => setOpenActions(false)

  const actionButtons = (
    <div sx={{ width: ["auto", "100%"], flex: "column", gap: 10 }}>
      <Button
        fullWidth
        size="small"
        onClick={() => {
          setOpenAdd(true)
          closeActionsDrawer()
        }}
      >
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<PlusIcon />} sx={{ mr: 8 }} />
          {t("pools.pool.actions.addLiquidity")}
        </div>
      </Button>
    </div>
  )

  return (
    <>
      {isDesktop ? (
        <SActionsContainer>
          {actionButtons}
          <SButtonOpen
            name="Expand"
            icon={<ChevronDown />}
            isActive={isExpanded}
            onClick={onExpandClick}
            disabled={!account || !canExpand}
          />
        </SActionsContainer>
      ) : (
        <>
          <Modal
            open={openActions}
            isDrawer
            titleDrawer={t("pools.pool.actions.header", {
              tokens: `${pool.symbol}/${pool.symbol}`,
            })}
            onClose={closeActionsDrawer}
          >
            {actionButtons}
          </Modal>
          <Button size="small" onClick={() => setOpenActions(true)}>
            <div sx={{ flex: "row", align: "center", justify: "center" }}>
              <Icon icon={<MoreIcon />} sx={{ mr: 8 }} />
              {t("pools.pool.actions.more")}
            </div>
          </Button>
        </>
      )}
      {openAdd && (
        <AddLiquidity
          isOpen={openAdd}
          onClose={() => setOpenAdd(false)}
          pool={pool}
          onSuccess={refetch}
        />
      )}
    </>
  )
}
