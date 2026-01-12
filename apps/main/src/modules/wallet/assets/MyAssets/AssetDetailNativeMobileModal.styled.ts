import { Modal, ModalBody, Separator } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SAssetDetailModal = styled(Modal)`
  --modal-content-padding: 16px;
`

export const SAssetDetailModalBody = styled(ModalBody)(
  ({ theme }) => css`
    --modal-body-padding: 16px;
    padding-inline: var(--modal-body-padding);
    padding-block: 0;

    display: flex;
    flex-direction: column;
    gap: ${theme.scales.paddings.xl}px;

    position: relative;
  `,
)

export const SAssetDetailMobileSeparator = styled(Separator)`
  margin-inline: calc(-1 * var(--modal-body-padding));
`
