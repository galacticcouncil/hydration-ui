import { Box, ModalBody } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

const shouldForwardProp = (prop: string) => prop !== "isMobile"

export const SAddressBookModalBody = styled(ModalBody, {
  shouldForwardProp,
})<{ isMobile?: boolean }>(
  ({ theme, isMobile }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xl};
    padding-bottom: 0;

    ${isMobile &&
    css`
      flex: 1;
      min-height: 0;
    `}
  `,
)

export const SAddressBookModalControls = styled(Box)(
  ({ theme }) => css`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: ${theme.space.l};
  `,
)

export const SAddressBookModalContent = styled(Box, { shouldForwardProp })<{
  isMobile?: boolean
}>(
  ({ theme, isMobile }) => css`
    border-top: 1px solid ${theme.details.separators};
    margin-inline: var(--modal-content-inset);

    ${isMobile &&
    css`
      flex: 1;
      min-height: 0;
    `}
  `,
)
