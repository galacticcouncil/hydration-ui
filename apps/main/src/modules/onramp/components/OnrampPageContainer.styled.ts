import { ModalContainer } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

export const SOnrampPageContainer = styled(ModalContainer, {
  shouldForwardProp: (prop) =>
    prop !== "wide" && prop !== "boundedMobilePicker",
})<{ wide?: boolean; boundedMobilePicker?: boolean }>`
  width: 100%;
  max-width: ${({ wide }) => pxToRem(wide ? 600 : 520)};

  ${({ theme, boundedMobilePicker }) =>
    boundedMobilePicker &&
    css`
      ${mq("max-xs")} {
        /* Leave room for the native header and mobile navigation around this page. */
        height: calc(
          100dvh - ${pxToRem(54 + 60)} - ${theme.space.m} - var(
              --layout-bottom-safe-area
            )
        );
        min-height: 0;

        & > div {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }
      }
    `}
`
