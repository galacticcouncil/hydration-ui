import { Modal, ModalBody, Separator } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

export const AssetDetailModal = styled(Modal)`
  --modal-content-padding: 16px;
`

export const AssetDetailModalBody = styled(ModalBody)`
  --modal-body-padding: 16px;
  padding: var(--modal-body-padding);
  padding-top: 0;

  &&&& {
    border-top: none;
  }
`

export const AssetDetailMobileSeparator = styled(Separator)`
  margin: 0 calc(0px - var(--modal-body-padding));
  width: calc(100% + calc(2 * var(--modal-body-padding)));
`
