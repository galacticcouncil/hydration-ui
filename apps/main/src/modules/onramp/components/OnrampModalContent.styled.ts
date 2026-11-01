import { ModalContent } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

import { SOnrampFlowContent } from "./OnrampFlowContent.styled"

export const ONRAMP_STEP_TRANSITION = {
  duration: 150,
  easing: "outExpo",
} as const

// The shared modal wrapper is outside the styled content's DOM subtree.
export const onrampModalWrapperStyles = css`
  div:has(> [data-onramp-modal]) {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`

export const SOnrampModalContent = styled(ModalContent)`
  --modal-resize-duration: ${ONRAMP_STEP_TRANSITION.duration}ms;
  --modal-resize-easing: ${({ theme }) =>
    theme.easings[ONRAMP_STEP_TRANSITION.easing]};
  --onramp-content-target-width: min(
    var(--modal-content-width),
    calc(100vw - 2 * ${({ theme }) => theme.space.l})
  );

  ${mq("max-xs")} {
    --modal-content-padding: ${({ theme }) => theme.space.l};
  }

  &,
  & * {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  /* Radix draws its scrollbars beside the viewport, separately from native bars. */
  [data-radix-scroll-area-viewport] ~ [data-orientation] {
    display: none;
  }
`

export const SOnrampBottomContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.space.m};
  width: 100%;
  padding-top: ${({ theme }) => theme.space.m};

  ${mq("max-xs")} {
    padding: ${({ theme }) => theme.space.m} ${({ theme }) => theme.space.l}
      max(${({ theme }) => theme.space.m}, env(safe-area-inset-bottom));
  }
`

export const SOnrampModalFooterSlot = styled.div`
  display: flex;
  min-width: 0;

  &:empty {
    display: none;
  }
`

export const SOnrampFlowSwitcherSlot = styled.div`
  display: flex;
  justify-content: center;
  flex-shrink: 0;

  &:empty {
    display: none;
  }
`

export const SOnrampModalViewport = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  flex-shrink: 0;
  overflow: visible;
  transition: height var(--modal-resize-duration) var(--modal-resize-easing);

  ${mq("sm")} {
    height: auto;
    overflow: hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export const SOnrampModalIntrinsicContent = styled(SOnrampFlowContent)`
  width: 100%;
  height: 100%;
  min-height: 0;

  ${mq("sm")} {
    height: auto;
    /* Follow the dialog's animated width instead of jumping to the next step. */
    width: 100%;
    flex-shrink: 0;
  }
`
