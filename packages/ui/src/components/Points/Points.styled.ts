import styled from "@emotion/styled"

import { createVariants, css, pxToRem } from "@/utils"

export type PointsSize = "m" | "l"

const pointsSizes = createVariants<PointsSize>((theme) => ({
  m: css`
    display: flex;
    gap: ${theme.space.m};

    padding-block: ${theme.containers.paddings.quart};
  `,
  l: css`
    display: flex;
    gap: ${theme.space.xl};

    padding-block: ${theme.containers.paddings.secondary};
  `,
}))

export const SPointsContainer = styled.div<{ readonly size: PointsSize }>(
  ({ size }) => pointsSizes(size),
)

const pointsNumberContainerSizes = createVariants<PointsSize>(() => ({
  m: css`
    width: ${pxToRem(25)};
    height: ${pxToRem(25)};
  `,
  l: css`
    width: ${pxToRem(33)};
    height: ${pxToRem(33)};
  `,
}))

export const SPointsNumberContainer = styled.div<{ readonly size: PointsSize }>(
  ({ theme, size }) => [
    css`
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      color: ${theme.details.separatorsOnDim};
      border: 1px solid ${theme.text.tint.secondary};
      border-radius: ${theme.containers.cornerRadius.buttonsPrimary};
    `,
    pointsNumberContainerSizes(size),
  ],
)

const pointsNumberSizes = createVariants<PointsSize>((theme) => ({
  m: css`
    font-family: ${theme.fontFamilies1.primary};
    font-weight: 700;
    font-size: ${theme.fontSizes.p5};
    line-height: 1.3;
    color: ${theme.text.high};
  `,
  l: css`
    font-family: ${theme.fontFamilies1.primary};
    font-weight: 700;
    font-size: ${theme.fontSizes.base};
    line-height: 1.3;
    color: ${theme.text.high};
  `,
}))

export const SPointsNumber = styled.p<{ readonly size: PointsSize }>(
  ({ size }) => pointsNumberSizes(size),
)

const pointsTextContentSizes = createVariants<PointsSize>((theme) => ({
  m: css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xs};
  `,
  l: css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.s};
  `,
}))

export const SPointsTextContent = styled.div<{ readonly size: PointsSize }>(
  ({ size }) => pointsTextContentSizes(size),
)

const pointsTitleSizes = createVariants<PointsSize>((theme) => ({
  m: css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 600;
    font-size: ${theme.fontSizes.base};
    line-height: 1.3;
    color: ${theme.text.high};
  `,
  l: css`
    font-family: ${theme.fontFamilies1.primary};
    font-weight: 700;
    font-size: ${theme.fontSizes.base};
    line-height: 1.3;
    color: ${theme.text.high};
  `,
}))

export const SPointsTitle = styled.p<{ readonly size: PointsSize }>(
  ({ size }) => pointsTitleSizes(size),
)

const pointsDescriptionSizes = createVariants<PointsSize>((theme) => ({
  m: css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;
    font-size: ${theme.fontSizes.p4};
    line-height: 15px;
    color: ${theme.text.medium};
  `,
  l: css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;
    font-size: ${theme.fontSizes.p3};
    line-height: 1.4;
    color: ${theme.text.medium};
  `,
}))

export const SPointsDescription = styled.p<{ readonly size: PointsSize }>(
  ({ size }) => pointsDescriptionSizes(size),
)
