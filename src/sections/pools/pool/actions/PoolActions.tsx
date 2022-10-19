import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { ReactComponent as MinusIcon } from "assets/icons/MinusIcon.svg"
import { ReactComponent as PlusIcon } from "assets/icons/PlusIcon.svg"
import { ReactComponent as WindMillIcon } from "assets/icons/WindMillIcon.svg"
import { ReactComponent as MoreIcon } from "assets/icons/MoreIcon.svg"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { PoolAddLiquidity } from "sections/pools/pool/modals/addLiquidity/PoolAddLiquidity"
import { PoolRemoveLiquidity } from "sections/pools/pool/modals/removeLiquidity/PoolRemoveLiquidity"
import { PoolJoinFarm } from "sections/pools/pool/modals/joinFarm/PoolJoinFarm"
import { PoolBase } from "@galacticcouncil/sdk"
import {
  SActionsContainer,
  SButtonOpen,
} from "sections/pools/pool/actions/PoolActions.styled"
import { useAccountStore } from "state/store"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Modal } from "components/Modal/Modal"

type Props = { pool: PoolBase; isExpanded: boolean; onExpandClick: () => void }

export const PoolActions: FC<Props> = ({ pool, isExpanded, onExpandClick }) => {
  const { t } = useTranslation()
  const [openAdd, setOpenAdd] = useState(false)
  const [openRemove, setOpenRemove] = useState(false)
  const [openFarms, setOpenFarms] = useState(false)
  const [openActions, setOpenActions] = useState(false)
  const { account } = useAccountStore()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const actionButtons = (
    <div sx={{ width: ["auto", 214], flex: "column", gap: 10 }}>
      <Button fullWidth size="small" onClick={() => setOpenAdd(true)}>
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<PlusIcon />} sx={{ mr: 11 }} />
          {t("pools.pool.actions.addLiquidity")}
        </div>
      </Button>

      <Button fullWidth size="small" onClick={() => setOpenRemove(true)}>
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<MinusIcon />} sx={{ mr: 11 }} />
          {t("pools.pool.actions.removeLiquidity")}
        </div>
      </Button>

      <Button fullWidth size="small" onClick={() => setOpenFarms(true)}>
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<WindMillIcon />} sx={{ mr: 11 }} />
          {t("pools.pool.actions.joinFarm")}
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
            isActive={isExpanded}
            onClick={onExpandClick}
            disabled={!account}
          >
            <ChevronDown />
          </SButtonOpen>
        </SActionsContainer>
      ) : (
        <>
          <Modal
            open={openActions}
            isDrawer
            titleDrawer={t("pools.pool.actions.header", {
              tokens: `${pool.tokens[0].symbol}/${pool.tokens[1].symbol}`,
            })}
            onClose={() => setOpenActions(false)}
          >
            {actionButtons}
          </Modal>
          <Button size="small" onClick={() => setOpenActions(true)}>
            <div sx={{ flex: "row", align: "center", justify: "center" }}>
              <Icon icon={<MoreIcon />} sx={{ mr: 11 }} />
              {t("pools.pool.actions.more")}
            </div>
          </Button>
        </>
      )}

      <PoolAddLiquidity
        isOpen={openAdd}
        onClose={() => setOpenAdd(false)}
        poolAddress={pool.address}
      />
      <PoolRemoveLiquidity
        isOpen={openRemove}
        onClose={() => setOpenRemove(false)}
        pool={pool}
      />
      <PoolJoinFarm
        pool={pool}
        isOpen={openFarms}
        onClose={() => setOpenFarms(false)}
        onSelect={() => setOpenFarms(false)}
      />
    </>
  )
}
