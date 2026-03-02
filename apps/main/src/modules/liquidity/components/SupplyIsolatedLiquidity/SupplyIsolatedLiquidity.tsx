import {
  CollateralState,
  HealthFactorChange,
} from "@galacticcouncil/money-market/components"
import {
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from "@galacticcouncil/money-market/hooks"
import {
  Alert,
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Stack,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData, TErc20 } from "@/api/assets"
import { useUserBorrowSummary } from "@/api/borrow/queries"
import {
  TAssetWithBalance,
  useAssetSelectModalAssets,
} from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { getApyLabel } from "@/modules/borrow/hooks/useApyBreakdownItems"
import {
  TSupplyIsolatedLiquidityFormValues,
  useSupplyIsolatedLiquidity,
} from "@/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity.utils"
import {
  TradeLimit,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import { useAssets } from "@/providers/assetsProvider"

export const SupplyIsolatedLiquidity = ({
  assetId,
  onSubmitted,
}: {
  assetId: string
  onSubmitted: () => void
}) => {
  const { tradable, native, getRelatedAToken } = useAssets()
  const { data: userBorrowData } = useUserBorrowSummary()
  const aToken = getRelatedAToken(assetId)
  const selectabledAssets = useAssetSelectModalAssets({
    assets: tradable,
    search: "",
    ignoreAssetIds: aToken ? [aToken.id] : undefined,
    highPriorityAssetIds: [assetId],
    lowPriorityAssetIds: [native.id],
  })
  const initialAsset = selectabledAssets.sortedAssets[0]

  const supplyAssetAddress = getAddressFromAssetId(assetId)

  const userReserve = userBorrowData?.userReservesData.find(
    (reserve) => reserve.underlyingAsset === supplyAssetAddress,
  )

  if (
    selectabledAssets.isLoading ||
    !initialAsset ||
    !aToken ||
    !userBorrowData ||
    !userReserve
  )
    return null

  return (
    <SupplyIsolatedLiquidityBody
      initialAsset={initialAsset}
      selectabledAssets={selectabledAssets.sortedAssets}
      assetId={assetId}
      aToken={aToken}
      userBorrowData={userBorrowData}
      userReserve={userReserve}
      onSubmitted={onSubmitted}
    />
  )
}

const SupplyIsolatedLiquidityBody = ({
  initialAsset,
  selectabledAssets,
  assetId,
  aToken,
  userBorrowData,
  userReserve,
  onSubmitted,
}: {
  initialAsset: TAssetData
  selectabledAssets: TAssetWithBalance[]
  assetId: string
  aToken: TErc20
  userBorrowData: ExtendedFormattedUser
  userReserve: ComputedUserReserveData
  onSubmitted: () => void
}) => {
  const { t } = useTranslation(["common", "liquidity", "borrow"])
  const {
    form,
    onSubmit,
    collateralType,
    healthFactor,
    isBlockedByBorrowedAssets,
    isEnablingIsolatedModeWarning,
    isolationWarning,
    supplyCapWarning,
    debtCeilingWarning,
    isBlockedSupply,
    minReceiveAmountShifted,
    apys,
  } = useSupplyIsolatedLiquidity({
    initialAsset,
    supplyAssetId: assetId,
    aToken,
    userBorrowData,
    userReserve,
    onSubmitted,
  })

  return (
    <FormProvider {...form}>
      <ModalHeader title={t("borrow:supply")} closable />
      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
        <ModalBody>
          <AssetSelectFormField<TSupplyIsolatedLiquidityFormValues>
            label={t("amount")}
            assetFieldName="asset"
            amountFieldName="amount"
            sortedAssets={selectabledAssets}
            assets={[]}
            sx={{ pt: 0 }}
          />

          <ModalContentDivider />

          <Stack gap="m" py="m" separated separator={<ModalContentDivider />}>
            {apys.map((apy, index) => (
              <SummaryRow
                key={index}
                label={getApyLabel(apy.apyType, true)}
                content={t("percent", {
                  value: apy.apy,
                })}
                sx={{ my: 0 }}
              />
            ))}
            <SummaryRow
              label={t("tradeLimit")}
              content={<TradeLimit type={TradeLimitType.Trade} />}
              sx={{ my: 0 }}
            />
            <SummaryRow
              label={t("minimumReceived")}
              content={t("common:currency", {
                value: minReceiveAmountShifted,
                symbol: aToken.symbol,
              })}
              sx={{ my: 0 }}
            />
            {collateralType && (
              <SummaryRow
                label="Collateral"
                content={<CollateralState collateralType={collateralType} />}
                sx={{ my: 0 }}
              />
            )}
            {healthFactor && (
              <SummaryRow
                label={t("healthFactor")}
                content={<HealthFactorChange {...healthFactor} fontSize="p5" />}
                sx={{ my: 0 }}
              />
            )}
            {isolationWarning && (
              <Alert
                title={t("borrow:alert.enableIsolatedMode.title")}
                description={t("borrow:alert.enableIsolatedMode.desc", {
                  symbol: userReserve.reserve.symbol,
                })}
              />
            )}
            {supplyCapWarning}
            {debtCeilingWarning}
            {isBlockedByBorrowedAssets && (
              <Alert
                variant="warning"
                description={t("borrow:alert.borrowIsolated", {
                  symbol: userReserve.reserve.symbol,
                })}
              />
            )}
            {isEnablingIsolatedModeWarning && (
              <Alert
                variant="warning"
                description={t("borrow:alert.supplyIsolated", {
                  symbol: userReserve.reserve.symbol,
                })}
              />
            )}
          </Stack>

          <ModalContentDivider />
        </ModalBody>
        <ModalFooter sx={{ pt: 0 }}>
          <Button
            type="submit"
            size="large"
            width="100%"
            disabled={isBlockedSupply || !form.formState.isValid}
          >
            {t("borrow:supply")}
          </Button>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
