import { FC } from "react"
import { useTranslation } from "react-i18next"
import { Modal } from "components/Modal/Modal"
import { LiquidityPosition } from "../../pool/positions/LiquidityPosition"
import { usePoolPositions } from "../../pool/Pool.utils"
import { OmnipoolPool } from "../../PoolsPage.utils"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as ListActionsIcon } from "assets/icons/ListActionsIcon.svg"

interface Props {
  isOpen: boolean
  pool: OmnipoolPool
  onClose: () => void
}

export const LiquidityPositions: FC<Props> = ({ isOpen, pool, onClose }) => {
  const positions = usePoolPositions(pool)
  const { t } = useTranslation()

  return (
    <Modal
      open={isOpen}
      withoutOutsideClose
      title={t("liquidity.positions.modal.title")}
      onClose={() => {
        onClose()
      }}
    >
      <div
        sx={{
          flex: "row",
          mt: 20,
          mb: 17,
          gap: 8,
          align: "center",
        }}
      >
        <ListActionsIcon
          sx={{
            color: "pink600",
          }}
        />
        <Text color="pink600" fs={17} fw={500}>
          {t("liquidity.positions.modal.nftPositions")}
        </Text>
      </div>
      <div sx={{ flex: "column", gap: 16 }}>
        {positions.data.map((position, i) => (
          <LiquidityPosition
            key={`${i}-${position.assetId}`}
            position={position}
            index={i + 1}
            onSuccess={positions.refetch}
          />
        ))}
      </div>
    </Modal>
  )
}
