import HollarBond from "@galacticcouncil/ui/assets/images/HollarBond.webp"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"

import { SContainer } from "./StableBondsSoldOut.styled"

export const StableBondsSoldOut: React.FC = () => {
  const { t } = useTranslation("strategies")

  return (
    <SContainer>
      <EmptyState
        sx={{ maxWidth: "100%" }}
        image={HollarBond}
        header={t("bonds.deposit.soldOut.header")}
        description={t("bonds.deposit.soldOut.description")}
      />
    </SContainer>
  )
}
