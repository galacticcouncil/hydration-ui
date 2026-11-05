import { Box, Flex } from "@galacticcouncil/ui/components"
import { pxToRem, styled } from "@galacticcouncil/ui/utils"

export const SBankTimelineRow = styled(Flex, {
  shouldForwardProp: (prop) => prop !== "confirmed" && prop !== "last",
})<{
  confirmed: boolean
  last: boolean
}>`
  position: relative;
  gap: ${({ theme }) => theme.space.m};
  min-height: ${pxToRem(64)};
  padding-bottom: ${({ theme }) => theme.space.l};

  &::before {
    content: "";
    position: absolute;
    left: ${pxToRem(9)};
    top: ${pxToRem(22)};
    bottom: ${pxToRem(2)};
    width: ${pxToRem(2)};
    background: ${({ theme, confirmed }) =>
      confirmed ? theme.accents.success.dim : theme.details.separators};
  }

  ${({ last }) => last && `&::before { display: none; }`}
`

export const SBankTimelineMarker = styled(Box, {
  shouldForwardProp: (prop) => prop !== "state",
})<{
  state: "confirmed" | "current" | "pending"
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${pxToRem(20)};
  height: ${pxToRem(20)};
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  border: ${({ state }) => (state === "pending" ? "1px solid" : "none")};
  border-color: ${({ theme }) => theme.details.borders};
  color: ${({ theme, state }) =>
    state === "confirmed"
      ? theme.accents.success.emphasis
      : theme.colors.azureBlue[500]};
  background: ${({ theme, state }) =>
    state === "confirmed"
      ? theme.accents.success.dim
      : state === "current"
        ? theme.colors.azureBlue.alpha[500]
        : "transparent"};
`
