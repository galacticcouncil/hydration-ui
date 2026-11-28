import { Plus } from "@galacticcouncil/ui/assets/icons"
import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { Button } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"
import { useOnrampModalStore } from "@/modules/onramp/store/useOnrampModalStore"

export const MyAssetsEmptyState: FC = () => {
  const { t } = useTranslation(["wallet"])
  const openOnramp = useOnrampModalStore((state) => state.open)

  return (
    <EmptyState
      sx={{ py: "xxxl" }}
      image={NoFunds}
      header={t("wallet:myAssets.emptyState.header")}
      description={t("wallet:myAssets.emptyState.description")}
      action={
        <Button variant="secondary" onClick={() => openOnramp("deposit")}>
          <Plus />
          {t("wallet:myAssets.emptyState.cta")}
        </Button>
      }
    />
  )
}
