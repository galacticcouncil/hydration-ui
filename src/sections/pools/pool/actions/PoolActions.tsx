import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { ReactComponent as MinusIcon } from "assets/icons/MinusIcon.svg"
import { ReactComponent as PlusIcon } from "assets/icons/PlusIcon.svg"
import { ReactComponent as WindMillIcon } from "assets/icons/WindMillIcon.svg"
import { Box } from "components/Box/Box"
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
      <Box flex spread acenter m="24px" width={280}>
        <Box width={214} flex column gap={10}>
          <Button fullWidth size="small" onClick={() => setOpenAdd(true)}>
            <Box flex acenter jcenter>
              <Icon icon={<PlusIcon />} mr={11} />
              {t("pools.pool.actions.addLiquidity")}
            </Box>
          </Button>

          <Button fullWidth size="small" onClick={() => setOpenRemove(true)}>
            <Box flex acenter jcenter>
              <Icon icon={<MinusIcon />} mr={11} />
              {t("pools.pool.actions.removeLiquidity")}
            </Box>
          </Button>

          <Button fullWidth size="small" onClick={() => setOpenFarms(true)}>
            <Box flex acenter jcenter>
              <Icon icon={<WindMillIcon />} mr={11} />
              {t("pools.pool.actions.joinFarm")}
            </Box>
          </Button>
        </Box>
        <SButtonOpen
          isActive={isExpanded}
          onClick={onExpandClick}
          disabled={!account}
        >
          <ChevronDown />
        </SButtonOpen>
      </Box>
      <PoolAddLiquidity
        isOpen={openAdd}
        onClose={() => setOpenAdd(false)}
        pool={pool}
      />
      <PoolRemoveLiquidity
        isOpen={openRemove}
        onClose={() => setOpenRemove(false)}
        pool={pool}
      />
      <PoolJoinFarm
        poolId={pool.address}
        assetA={pool.tokens[0]}
        assetB={pool.tokens[1]}
        isOpen={openFarms}
        onClose={() => setOpenFarms(false)}
        onSelect={() => {
          setOpenFarms(false)
        }}
      />
    </>
  )
}
