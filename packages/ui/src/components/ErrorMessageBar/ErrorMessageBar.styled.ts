import { Icon } from "@/components/Icon"
import { createVariants, css, styled } from "@/utils"

export type ErrorMessageBarVariant = "info" | "error" | "warning"

const containerVariants = createVariants<ErrorMessageBarVariant>((theme) => ({
  info: css`
    background: ${theme.colors.azureBlue.alpha[500]};
  `,
  error: css`
    background: ${theme.accents.danger.dimBg};
  `,
  warning: css`
    background: ${theme.accents.alert.dimBg};
  `,
}))

export const SErrorMessageBarContainer = styled.div<{
  readonly variant?: ErrorMessageBarVariant
}>(({ theme, variant = "info" }) => [
  css`
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px;

    padding: ${theme.containers.paddings.quart}px;
    border-radius: 8px;
  `,
  containerVariants(variant),
])

const textColorVariants = createVariants<ErrorMessageBarVariant>((theme) => ({
  info: css`
    color: ${theme.accents.info.onPrimary};
  `,
  error: css`
    color: #ff674c;
  `,
  warning: css`
    color: ${theme.accents.alert.primary};
  `,
}))

export const SErrorMessageBarTitle = styled.span<{
  readonly variant?: ErrorMessageBarVariant
}>(({ theme, variant = "info" }) => [
  css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 500;
    font-size: ${theme.paragraphSize.p4};
    line-height: 1;
  `,
  textColorVariants(variant),
])

export const SErrorMessageBarIcon = styled(Icon)<{
  readonly variant: ErrorMessageBarVariant
}>(({ variant }) => [
  css`
    width: 14px;
    height: 14px;
  `,
  textColorVariants(variant),
])
