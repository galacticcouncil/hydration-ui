import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { STHDX_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import {
  Box,
  LoadingButton,
  Separator,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useNativeTokenLocks } from "@/api/balances"
import {
  borrowReservesQuery,
  gigaLendingPoolAddressProvider,
  useBorrowPoolDataContract,
} from "@/api/borrow"
import { gigaStakeConstantsQuery } from "@/api/gigaStake"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useGigaStake } from "@/modules/staking/gigaStaking/stake/GigaStake.utils"
import { GigaStakeSkeleton } from "@/modules/staking/gigaStaking/stake/GigaStakeSkeleton"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"

export type GigaStakeProps = {
  minStake: bigint
  hdxReserve: ComputedReserveData
}

export const GigaStake = ({ loading }: { loading?: boolean }) => {
  const rpc = useRpcProvider()
  const { data: constants } = useQuery(gigaStakeConstantsQuery(rpc))
  const { isBalanceLoading } = useAccountBalances()
  const { isLoading: isLocksLoading } = useNativeTokenLocks()

  const { data: gigaPoolReserves } = useQuery(
    borrowReservesQuery(
      rpc,
      gigaLendingPoolAddressProvider,
      useBorrowPoolDataContract(),
      null,
    ),
  )

  const hdxReserve = gigaPoolReserves?.formattedReserves.find(
    (reserve) =>
      reserve.underlyingAsset === getAddressFromAssetId(STHDX_ASSET_ID),
  )

  if (
    isBalanceLoading ||
    loading ||
    !constants ||
    !hdxReserve ||
    isLocksLoading
  ) {
    return <GigaStakeSkeleton />
  }

  const minStake = constants.minStake

  return <GigaStakeForm minStake={minStake} hdxReserve={hdxReserve} />
}

const GigaStakeForm: FC<GigaStakeProps> = ({ minStake, hdxReserve }) => {
  const { t } = useTranslation(["staking", "common"])
  const {
    form,
    minStakeHuman,
    meta,
    onSubmit,
    isSubmitting,
    maxStakeHuman,
    amountInGigaHdx,
    gigaHdxMeta,
  } = useGigaStake({
    minStake,
    hdxReserve,
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Box px="l" asChild>
          <AssetSelectFormField
            assetFieldName="asset"
            amountFieldName="amount"
            label={t("gigaStaking.gigaStake.input.label")}
            assets={[]}
            disabledAssetSelector
            maxBalance={maxStakeHuman}
          />
        </Box>

        <Separator />

        <Box px="l" asChild>
          <Summary
            rows={[
              {
                label: t("gigaStaking.gigaStake.minStake.label"),
                content: (
                  <Text>
                    {t("common:currency", {
                      value: minStakeHuman,
                      symbol: meta.symbol,
                    })}
                  </Text>
                ),
              },
              {
                label: t("gigaStaking.gigaStake.receive.label"),
                content: (
                  <Text>
                    {t("common:currency", {
                      prefix: "≈",
                      value: amountInGigaHdx,
                      symbol: gigaHdxMeta.symbol,
                    })}
                  </Text>
                ),
              },
            ]}
          />
        </Box>

        <Separator />

        <Box p="l">
          <LoadingButton
            isLoading={isSubmitting}
            type="submit"
            size="large"
            width="100%"
            disabled={!form.formState.isValid || isSubmitting}
          >
            {t("gigaStaking.gigaStake.cta")}
          </LoadingButton>
        </Box>
      </form>
    </FormProvider>
  )
}
