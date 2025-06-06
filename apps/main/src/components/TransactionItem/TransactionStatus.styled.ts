import { Text } from "@galacticcouncil/ui/components"
import { createVariants, css, styled } from "@galacticcouncil/ui/utils"

export enum TransactionStatusVariant {
  Pending = "Pending",
  Success = "Success",
  Warning = "Warning",
}

const colorVariants = createVariants<TransactionStatusVariant>((theme) => ({
  [TransactionStatusVariant.Pending]: css`
    color: ${theme.text.tint.quart};
  `,
  [TransactionStatusVariant.Success]: css`
    color: ${theme.accents.success.emphasis};
  `,
  [TransactionStatusVariant.Warning]: css`
    color: ${theme.accents.alertAlt.primary};
  `,
}))

export const STransactionStatus = styled.span<{
  readonly variant: TransactionStatusVariant
}>(({ variant }) => [
  css`
    display: flex;
    align-items: center;
    gap: 4px;
  `,
  colorVariants(variant),
])

export const STransactionStatusMessage = styled(Text)<{
  readonly variant: TransactionStatusVariant
}>(({ variant }) => colorVariants(variant))
