import { Modal } from "components/Modal/Modal"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { usePools } from "api/pools"
import { PoolAddLiquidityModal } from "./PoolAddLiquidityModal"

type Props = {
  isOpen: boolean
  onClose: () => void
  poolAddress: string
}

export const PoolAddLiquidity: FC<Props> = ({ isOpen, onClose, ...props }) => {
  const [poolAddress, setPoolAddress] = useState(props.poolAddress)
  const { t } = useTranslation()

  const pools = usePools()
  const pool = pools.data?.find((pool) => pool.address === poolAddress)

  return (
    <Modal
      open={isOpen}
      title={t("pools.addLiquidity.modal.title")}
      onClose={onClose}
    >
      {pool && (
        <PoolAddLiquidityModal pool={pool} setPoolAddress={setPoolAddress} />
      )}
    </Modal>
  )
}
