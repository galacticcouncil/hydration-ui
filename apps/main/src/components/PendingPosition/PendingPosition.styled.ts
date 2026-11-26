import { type SerializedStyles } from "@emotion/react"
import { Box, Flex, Separator } from "@galacticcouncil/ui/components"
import { containerSize, css, styled } from "@galacticcouncil/ui/utils"

const BREAKPOINT = "20rem"

type WrapProps = { forceWrap?: boolean }
const opts = { shouldForwardProp: (prop: string) => prop !== "forceWrap" }

const wide = ({ forceWrap }: WrapProps, styles: SerializedStyles) =>
  forceWrap ? null : containerSize(BREAKPOINT, styles)

export const SPendingPosition = styled(
  Flex,
  opts,
)<WrapProps>(
  (props) => css`
    padding: ${props.theme.containers.paddings.secondary};
    border-radius: ${props.theme.containers.cornerRadius.containersPrimary};
    background: ${props.theme.controls.dim.base};
    border: 1px solid ${props.theme.details.borders};
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${props.theme.space.base};

    ${wide(
      props,
      css`
        flex-wrap: nowrap;
        gap: 0;
      `,
    )}
  `,
)

export const SAmountSection = styled(
  Flex,
  opts,
)<WrapProps>(
  (props) => css`
    order: 0;
    flex: 1 1 auto;
    min-width: 0;
    align-items: center;
    gap: ${props.theme.space.base};

    ${wide(
      props,
      css`
        flex: 0 1 auto;
      `,
    )}
  `,
)

export const SActionsGroup = styled(
  Flex,
  opts,
)<WrapProps>(
  (props) => css`
    display: contents;

    ${wide(
      props,
      css`
        display: flex;
        order: 1;
        align-items: center;
        gap: ${props.theme.space.m};
        flex-shrink: 0;
      `,
    )}
  `,
)

export const SStatusSection = styled(
  Flex,
  opts,
)<WrapProps>(
  (props) => css`
    order: 3;
    flex-basis: 100%;
    width: 100%;
    align-items: center;
    gap: ${props.theme.space.m};

    ${wide(
      props,
      css`
        order: unset;
        flex-basis: auto;
        width: auto;
      `,
    )}
  `,
)

export const SActionSection = styled(
  Box,
  opts,
)<WrapProps>(
  (props) => css`
    order: 1;
    flex-shrink: 0;

    ${wide(
      props,
      css`
        order: unset;
      `,
    )}
  `,
)

export const SMobileSeparator = styled(
  Separator,
  opts,
)<WrapProps>(
  (props) => css`
    order: 2;
    flex-basis: 100%;
    width: 100%;

    ${wide(
      props,
      css`
        display: none;
      `,
    )}
  `,
)

export const SStat = styled(Box)(
  (props) => css`
    flex: 1 1 auto;

    & > div {
      align-items: flex-end;
      margin-bottom: -${props.theme.space.s};
    }

    ${containerSize(
      BREAKPOINT,
      css`
        & > div {
          flex-direction: column;
          align-items: flex-end;
          margin-bottom: 0;
        }
      `,
    )}
  `,
)
