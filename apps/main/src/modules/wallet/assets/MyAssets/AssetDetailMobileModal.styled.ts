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
  margin-inline: calc(-1 * var(--modal-body-padding));
`
