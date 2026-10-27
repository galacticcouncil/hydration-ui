import {
  AccountTile,
  Button,
  ButtonTransparent,
  Flex,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type DepositAccountButtonProps = {
  name: string
  address: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  onChange?: () => void
}

export const DepositAccountButton: FC<DepositAccountButtonProps> = ({
  onClick,
  onChange,
  disabled,
  ...props
}) => {
  const { t } = useTranslation("common")

  if (onChange)
    return (
      <AccountTile
        {...props}
        width="100%"
        action={
          <Flex align="center">
            <Button
              type="button"
              variant="secondary"
              outline
              size="micro"
              uppercase
              sx={{ py: "base", px: "m" }}
              disabled={disabled}
              onClick={onChange}
            >
              {t("change")}
            </Button>
          </Flex>
        }
      />
    )

  return onClick ? (
    <ButtonTransparent
      width="100%"
      onClick={onClick}
      disabled={disabled}
      sx={{ textAlign: "left" }}
    >
      <AccountTile {...props} width="100%" />
    </ButtonTransparent>
  ) : (
    <AccountTile {...props} width="100%" />
  )
}
