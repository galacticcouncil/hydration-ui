import {
  CollateralState,
  HealthFactorChange,
} from "@galacticcouncil/money-market/components"
import { ExtendedFormattedUser } from "@galacticcouncil/money-market/hooks"
import {
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Stack,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData, TErc20 } from "@/api/assets"
import { useUserBorrowSummary } from "@/api/borrow/queries"
import {
  TAssetWithBalance,
  useAssetSelectModalAssets,
} from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  TSupplyIsolatedLiquidityFormValues,
  useSupplyIsolatedLiquidity,
} from "@/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity.utils"
import { useAssets } from "@/providers/assetsProvider"

export const SupplyIsolatedLiquidity = ({ assetId }: { assetId: string }) => {
  const { tradable, native, getRelatedAToken } = useAssets()
  const { data: userBorrowData } = useUserBorrowSummary()
  const selectabledAssets = useAssetSelectModalAssets({
    assets: tradable,
    search: "",
    selectedAssetId: undefined,
    highPriorityAssetIds: [assetId],
    lowPriorityAssetIds: [native.id],
  })
  const initialAsset = selectabledAssets.sortedAssets[0]
  const aToken = getRelatedAToken(assetId)

  if (
    selectabledAssets.isLoading ||
    !initialAsset ||
    !aToken ||
    !userBorrowData
  )
    return null

  return (
    <SupplyIsolatedLiquidityBody
      initialAsset={initialAsset}
      selectabledAssets={selectabledAssets.sortedAssets}
      assetId={assetId}
      aToken={aToken}
      userBorrowData={userBorrowData}
    />
  )
}

const SupplyIsolatedLiquidityBody = ({
  initialAsset,
  selectabledAssets,
  assetId,
  aToken,
  userBorrowData,
}: {
  initialAsset: TAssetData
  selectabledAssets: TAssetWithBalance[]
  assetId: string
  aToken: TErc20
  userBorrowData: ExtendedFormattedUser
}) => {
  const { t } = useTranslation(["common", "liquidity", "borrow"])
  const { form, onSubmit, collateralType, healthFactor } =
    useSupplyIsolatedLiquidity({
      initialAsset,
      supplyAssetId: assetId,
      aToken,
      userBorrowData,
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

          {true && (
            <Stack
              gap="xs"
              py="m"
              separated
              separator={<ModalContentDivider />}
            >
              {collateralType && (
                <SummaryRow
                  label="Collateral"
                  content={<CollateralState collateralType={collateralType} />}
                />
              )}
              {healthFactor && (
                <SummaryRow
                  label={t("healthFactor")}
                  content={
                    <HealthFactorChange {...healthFactor} fontSize="p5" />
                  }
                />
              )}
              {/* {showIsolationWarning && (
                <IsolationModeWarning asset={poolReserve.symbol} />
              )}
              {supplyCapWarning}
              {debptCeilingWarning}
              {isBlockedSupplying && (
                <Alert
                  variant="warning"
                  description="To borrow against PRIME collateral your account must be in Isolated Mode. To continue, switch to an account with no active loans or repay all existing positions."
                />
              )}
              {showEnablingIsolatedModeWarning && (
                <Alert
                  variant="warning"
                  description={`To supply ${poolReserve.symbol} and enter Isolation mode all current collaterals will be disabled`}
                />
              )} */}
            </Stack>
          )}
          {/* <AddLiquiditySummary
            meta={poolMeta}
            poolShare={liquidityShares?.poolShare ?? "0"}
            minReceiveAmount={scaleHuman(
              liquidityShares?.minSharesToGet ?? "0",
              poolMeta.decimals,
            )}
            farms={joinFarmErrorMessage ? [] : activeFarms}
            healthFactor={healthFactor}
          />

          {customErrors?.cap ? (
            <Alert
              variant="warning"
              description={customErrors.cap.message}
              sx={{ my: "xxl" }}
            />
          ) : null}
          {customErrors?.circuitBreaker ? (
            <Alert
              variant="warning"
              description={customErrors.circuitBreaker.message}
              sx={{ my: "xxl" }}
            />
          ) : null}
          {joinFarmErrorMessage && (
            <Alert
              variant="warning"
              description={joinFarmErrorMessage}
              sx={{ my: "xxl" }}
            />
          )} */}

          <ModalContentDivider />
        </ModalBody>
        <ModalFooter sx={{ pt: 0 }}>
          <Button
            type="submit"
            size="large"
            width="100%"
            //disabled={!canAddLiquidity || !formState.isValid}
          >
            {t("borrow:supply")}
          </Button>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
