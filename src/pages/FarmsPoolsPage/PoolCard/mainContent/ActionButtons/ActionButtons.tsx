import { ChevronDown } from "assets/icons/ChevronDown"
import { MinusIcon } from "assets/icons/MinusIcon"
import { PlusIcon } from "assets/icons/PlusIcon"
import { WindMillIcon } from "assets/icons/WindMillIcon"
import { Box } from "components/Box/Box"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { IconButton } from "components/IconButton/IconButton"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { RemoveLiquidityModal } from "pages/FarmsPoolsPage/RemoveLiquidityModal/RemoveLiquidityModal"

type ActionButtonProps = {
  hasJoinedFarms: boolean
  closeCard: (val: boolean) => void
}

export const ActionButtons: FC<ActionButtonProps> = ({
  hasJoinedFarms,
  closeCard,
}) => {
  const { t } = useTranslation()

  const [addLiquidityOpen, setAddLiquidityOpen] = useState(false)
  const [removeLiquidityOpen, setRemoveLiquidityOpen] = useState(false)

  return (
    <>
      <Box flex spread acenter m="26px 0 48px" width={280}>
        <Box width={214} flex column gap={10} mr={hasJoinedFarms ? 33 : 67}>
          <Button
            fullWidth
            size="small"
            onClick={() => {
              setAddLiquidityOpen(true)
            }}
          >
            <Box flex acenter jcenter>
              <Icon icon={<PlusIcon />} mr={11} />
              {t("farmsPoolsPage.poolCard.actionButtons.addLiquidity")}
            </Box>
          </Button>

          <Button
            fullWidth
            size="small"
            onClick={() => {
              setRemoveLiquidityOpen(true)
            }}
          >
            <Box flex acenter jcenter>
              <Icon icon={<MinusIcon />} mr={11} />
              {t("farmsPoolsPage.poolCard.actionButtons.removeLiquidity")}
            </Box>
          </Button>

          <Button
            fullWidth
            size="small"
            onClick={(e) => {
              console.log("click")
            }}
          >
            <Box flex acenter jcenter>
              <Icon icon={<WindMillIcon />} mr={11} />
              {t("farmsPoolsPage.poolCard.actionButtons.joinFarm")}
            </Box>
          </Button>
        </Box>
        {hasJoinedFarms && (
          <IconButton
            icon={<ChevronDown />}
            width={6}
            height={3}
            name={t("farmsPoolsPage.poolCard.actionButtons.chevron.name")}
          />
        )}
      </Box>
      <Modal
        title="Modal title"
        open={addLiquidityOpen}
        onClose={() => setAddLiquidityOpen(false)}
      >
        <Text>Placeholder content</Text>
      </Modal>
      <RemoveLiquidityModal
        isOpen={removeLiquidityOpen}
        onClose={() => setRemoveLiquidityOpen(false)}
      />
    </>
  )
}
