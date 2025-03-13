import { createVariants, css, styled } from "@/utils"

export type AmountDisplaySize = "small" | "medium"

export const SAmountRoot = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.containers.paddings.senary}px;
  `,
)

export const SAmount = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.containers.paddings.senary}px;
  `,
)

export const SAmountLabel = styled.div(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-size: 12px;
    line-height: 1;
    font-weight: 400;

    color: ${theme.text.medium};
  `,
)

const amountValueSizeVariants = createVariants<AmountDisplaySize>((theme) => ({
  small: css`
    font-size: ${theme.paragraphSize.p5};
    line-height: ${theme.lineHeight.s}px;
    font-weight: 600;
  `,
  medium: css`
    font-size: ${theme.paragraphSize.p4};
    line-height: 1;
    font-weight: 500;
  `,
}))

export const SAmountValue = styled.div<{
  readonly size: AmountDisplaySize
}>(({ theme, size }) => [
  css`
    font-family: ${theme.fontFamilies1.secondary};
    color: ${theme.text.high};
  `,
  amountValueSizeVariants(size),
])

const amountDisplayValueSizeVariants = createVariants<AmountDisplaySize>(
  (theme) => ({
    small: css`
      font-size: ${theme.paragraphSize.p6};
      line-height: ${theme.lineHeight.s}px;
    `,
    medium: css`
      font-size: 10px;
      line-height: 1;
    `,
  }),
)

export const SAmountDisplayValue = styled.div<{
  readonly size: AmountDisplaySize
}>(({ theme, size }) => [
  css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;
    color: ${theme.text.low};
  `,
  amountDisplayValueSizeVariants(size),
])
