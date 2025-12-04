import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"

export const MyAssetsEmptyState: FC = () => {
  const { t } = useTranslation(["wallet"])

  return (
    <EmptyState
      sx={{ py: 80 }}
      image={NoFunds}
      header={t("wallet:myAssets.emptyState.header")}
      description={t("wallet:myAssets.emptyState.description")}
      // TODO show when XCM is ready
      // then also update description text to "Looks like you don’t have any assets on Hydration yet. Click below to add them through cross-chain transfers."
      // action={
      //   <Button variant="secondary" asChild>
      //     <Link to="/cross-chain">
      //       <ArrowDownUp />
      //       {t("wallet:myAssets.emptyState.cta")}
      //     </Link>
      //   </Button>
      // }
    />
  )
}
