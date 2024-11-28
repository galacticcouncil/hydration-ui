import { ModalType, useModalContext } from "sections/lending/hooks/useModal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { ClaimRewardsModalContent } from "./ClaimRewardsModalContent"

export const ClaimRewardsModal = () => {
  const { type, close } = useModalContext()
  return (
    <BasicModal open={type === ModalType.ClaimRewards} setOpen={close}>
      <ModalContents
        sx={{ color: "white" }}
        onClose={close}
        contents={[
          {
            title: "Claim Rewards",
            content: <ClaimRewardsModalContent />,
          },
        ]}
      />
    </BasicModal>
  )
}
