import { Box, Button, Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  UserGigaBorrowSummary,
  useUserGigaBorrowSummary,
} from "@/api/borrow/queries"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useGigaUnstake } from "@/modules/staking/gigaStaking/unstake/GigaUnstake.utils"
import { GigaUnstakeSkeleton } from "@/modules/staking/gigaStaking/unstake/GigaUnstakeSkeleton"

export type GigaUnstakeProps = {
  userBorrowSummary: UserGigaBorrowSummary
}

export const GigaUnstake = ({ loading }: { loading?: boolean }) => {
  const { data: gigaBorrowSummary } = useUserGigaBorrowSummary()

  if (loading || !gigaBorrowSummary) {
    return <GigaUnstakeSkeleton />
  }

  return <GigaUnstakeForm userBorrowSummary={gigaBorrowSummary} />
}

const GigaUnstakeForm: FC<GigaUnstakeProps> = ({ userBorrowSummary }) => {
  const { t } = useTranslation(["staking", "common"])
  const { form, onSubmit, maxUnstake } = useGigaUnstake({ userBorrowSummary })
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Box px="l" asChild>
          <AssetSelectFormField
            assetFieldName="asset"
            amountFieldName="amount"
            label={t("gigaStaking.gigaUnstake.input.label")}
            assets={[]}
            disabledAssetSelector
            maxBalance={maxUnstake}
            balanceLabel={t("common:available")}
          />
        </Box>

        <Separator />

        <Box p="l">
          <Button
            type="submit"
            size="large"
            width="100%"
            disabled={!form.formState.isValid}
          >
            {t("gigaStaking.gigaUnstake.cta")}
          </Button>
        </Box>
      </form>
    </FormProvider>
  )
}
