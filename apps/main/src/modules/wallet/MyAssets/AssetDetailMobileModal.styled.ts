import { Modal, ModalBody, Separator } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

export const SAssetDetailModal = styled(Modal)`
  --modal-content-padding: 16px;
`

export const SAssetDetailModalBody = styled(ModalBody)`
  --modal-body-padding: 16px;
  padding: var(--modal-body-padding);
  padding-top: 0;

  display: flex;
  flex-direction: column;
  gap: 16px;

  &&&& {
    border-top: none;
  }
`

export const SAssetDetailMobileSeparator = styled(Separator)`
  margin-inline: calc(-1 * var(--modal-body-padding));
`
