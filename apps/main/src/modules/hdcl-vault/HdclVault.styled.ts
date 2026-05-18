import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Box, Paper } from "@galacticcouncil/ui/components"

export const SContentCard = styled(Paper)(
  () => css`
    padding: 20px;
    border-radius: 16px;
  `,
)

export const SStickyCard = styled(Paper)(
  () => css`
    padding: 20px;
    border-radius: 16px;
    position: sticky;
    top: 20px;
    align-self: start;
  `,
)

export const STableRow = styled(Box)(
  ({ theme }) => css`
    display: grid;
    align-items: center;
    padding: 12px 0;
    border-top: 1px solid
      color-mix(in srgb, ${theme.details.borders} 60%, transparent);
  `,
)

export const STableHeader = styled(Box)(
  () => css`
    display: grid;
    align-items: center;
    margin-bottom: 8px;
  `,
)

export const SClickableRow = styled(Box)(
  () => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 4px 0;
    border-radius: 8px;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.8;
    }
  `,
)

export const STokenPill = styled(Box)(
  ({ theme }) => css`
    all: unset;
    box-sizing: border-box;

    display: flex;
    gap: 6px;
    align-items: center;

    padding: ${theme.space.s};
    padding-right: ${theme.space.m};
    min-width: fit-content;

    border-radius: 30px;
    border: 1px solid ${theme.buttons.secondary.low.borderRest};
  `,
)

export const STokenIcon = styled(Box)<{ variant: "hollar" | "hdcl" }>(
  ({ variant }) => css`
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${variant === "hollar"
      ? "linear-gradient(135deg, #9cc63e, #c2dc6f)"
      : "linear-gradient(135deg, #dfb1f3, #cf84ef)"};
    font-size: 10px;
    font-weight: 700;
    color: #fff;
  `,
)

export const SArrowToggle = styled(Box)(
  ({ theme }) => css`
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    background: ${theme.controls.dim.base};
    transition: transform 0.2s;

    &:hover {
      background: ${theme.controls.dim.hover};
      transform: rotate(180deg);
    }
  `,
)

export const SExchangeRatePill = styled(Box)(
  ({ theme }) => css`
    background: ${theme.controls.dim.base};
    border-radius: ${theme.containers?.cornerRadius?.containersPrimary ||
    "32px"};
    padding: 2px 14px;
    height: 28px;
    display: flex;
    align-items: center;
    &:hover {
      background: ${theme.controls.dim.hover};
    }
  `,
)

export const SModalBackdrop = styled(Box)(
  () => css`
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
  `,
)

export const SModalContent = styled(Paper)(
  () => css`
    max-width: 520px;
    width: 90%;
    padding: 24px;
    border-radius: 16px;
    max-height: 80vh;
    overflow-y: auto;
  `,
)

export const SCancelButton = styled(Box)<{ disabled?: boolean }>(
  ({ theme, disabled }) => css`
    all: unset;
    box-sizing: border-box;
    cursor: ${disabled ? "not-allowed" : "pointer"};
    opacity: ${disabled ? 0.4 : 1};
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    color: ${theme.colors.greys[400] || "#aeb0b7"};
    border: 1px solid ${theme.details.borders};
    transition: all 0.15s;

    &:hover:not([disabled]) {
      color: #fff;
      border-color: ${theme.colors.greys[400] || "#aeb0b7"};
    }
  `,
)

export const SPillTab = styled(Box)<{ isActive?: boolean }>(
  ({ theme, isActive }) => css`
    padding: 8px 20px;
    border-radius: 32px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    transition: all 0.15s;
    background-color: ${isActive
      ? theme.buttons.primary?.high?.rest || "#fc408c"
      : "transparent"};
    color: ${isActive ? "#fff" : theme.colors.greys[500] || "#aeb0b7"};
    border: 1px solid ${isActive ? "transparent" : theme.details.borders};

    &:hover {
      opacity: 0.85;
    }
  `,
)
