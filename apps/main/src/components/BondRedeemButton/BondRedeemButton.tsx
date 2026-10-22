import { Button, ButtonProps, Tooltip } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useBondData, useRedeemBond } from "@/api/bonds"

type BondRedeemButtonProps = Omit<
  ButtonProps,
  "variant" | "disabled" | "onClick"
> & {
  bondId: string
}

export const BondRedeemButton: FC<BondRedeemButtonProps> = ({
  bondId,
  ...props
}) => {
  const { t } = useTranslation(["common", "strategies"])
  const { balance, isMatured } = useBondData(bondId)
  const redeem = useRedeemBond()

  const isDisabled = !isMatured || balance === 0n || redeem.isPending

  return (
    <Tooltip
      asChild
      text={
        !isMatured
          ? t("strategies:bonds.position.availableAtMaturity")
          : undefined
      }
    >
      <Button
        variant={isDisabled ? "tertiary" : "secondary"}
        disabled={isDisabled}
        onClick={() =>
          redeem.mutate({
            bondId,
            amount: balance,
          })
        }
        {...props}
      >
        {t("redeem")}
      </Button>
    </Tooltip>
  )
}
