import {
  Alert,
  Box,
  Button,
  Separator,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
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
import { useAssets } from "@/providers/assetsProvider"

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
  const { native } = useAssets()
  const {
    form,
    onSubmit,
    maxUnstake,
    amountInHdx,
    frozenInGigaHdx,
    debtLockedInGigaHdx,
  } = useGigaUnstake({
    userBorrowSummary,
  })

  const hasLock = Big(frozenInGigaHdx).gt(0) || Big(debtLockedInGigaHdx).gt(0)
  const showFrozenLockAlert =
    hasLock && Big(frozenInGigaHdx).gte(Big(debtLockedInGigaHdx))

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

        <Box px="l" asChild>
          <Summary
            rows={[
              {
                label: t("gigaStaking.gigaUnstake.receive.label"),
                content: (
                  <Text>
                    {t("common:currency", {
                      prefix: "≈",
                      value: amountInHdx,
                      symbol: native.symbol,
                    })}
                  </Text>
                ),
              },
            ]}
          />
        </Box>

        <Separator />

        {hasLock && (
          <>
            <Alert
              sx={{ m: "l" }}
              variant="warning"
              title={
                showFrozenLockAlert
                  ? t("gigaStaking.gigaUnstake.frozen.alert", {
                      value: frozenInGigaHdx,
                    })
                  : t("gigaStaking.gigaUnstake.debtLocked.alert", {
                      value: debtLockedInGigaHdx,
                    })
              }
            />

            <Separator />
          </>
        )}

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
