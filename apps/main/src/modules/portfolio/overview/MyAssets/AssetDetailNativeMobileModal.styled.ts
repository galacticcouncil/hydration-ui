import { Modal, ModalBody, Separator } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SAssetDetailModal = styled(Modal)(
  ({ theme }) => css`
    --modal-content-padding: ${theme.space.l};
  `,
)

export const SAssetDetailModalBody = styled(ModalBody)(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xl};

    position: relative;
  `,
)

export const SAssetDetailMobileSeparator = styled(Separator)`
  margin-inline: calc(-1 * var(--modal-body-padding));
`
