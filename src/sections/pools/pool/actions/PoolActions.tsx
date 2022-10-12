import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { ReactComponent as MinusIcon } from "assets/icons/MinusIcon.svg"
import { ReactComponent as PlusIcon } from "assets/icons/PlusIcon.svg"
import { ReactComponent as WindMillIcon } from "assets/icons/WindMillIcon.svg"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { PoolAddLiquidity } from "sections/pools/pool/modals/addLiquidity/PoolAddLiquidity"
import { PoolRemoveLiquidity } from "sections/pools/pool/modals/removeLiquidity/PoolRemoveLiquidity"
import { PoolJoinFarm } from "sections/pools/pool/modals/joinFarm/PoolJoinFarm"
import { PoolBase } from "@galacticcouncil/sdk"
import { SButtonOpen } from "sections/pools/pool/actions/PoolActions.styled"
import { useAccountStore } from "state/store"

type Props = { pool: PoolBase; isExpanded: boolean; onExpandClick: () => void }

export const PoolActions: FC<Props> = ({ pool, isExpanded, onExpandClick }) => {
  const { t } = useTranslation()
  const [openAdd, setOpenAdd] = useState(false)
  const [openRemove, setOpenRemove] = useState(false)
  const [openFarms, setOpenFarms] = useState(false)
  const { account } = useAccountStore()

  return (
    <>
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          align: "center",
          m: 24,
          width: 280,
        }}
      >
        <div sx={{ width: 214, flex: "column", gap: 10 }}>
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
        <SButtonOpen
          isActive={isExpanded}
          onClick={onExpandClick}
          disabled={!account}
        >
          <ChevronDown />
        </SButtonOpen>
      </div>
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
        onSelect={() => {
          setOpenFarms(false)
        }}
      />
    </>
  )
}
