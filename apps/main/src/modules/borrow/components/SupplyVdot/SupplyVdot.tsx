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
  Box,
  LoadingButton,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Skeleton,
  Stack,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import {
  DOT_ASSET_ID,
  getAddressFromAssetId,
  VDOT_ASSET_ID,
} from "@galacticcouncil/utils"
import { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData, TErc20AToken } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import { useUserBorrowSummary } from "@/api/borrow/queries"
import {
  TAssetWithBalance,
  useAssetSelectModalAssets,
} from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { getApyLabel } from "@/modules/borrow/hooks/useApyBreakdownItems"
import { useAssets } from "@/providers/assetsProvider"
import { formatApyPercent } from "@/utils/formatApyPercent"

import { SupplyVdotFormValues, useSupplyVdot } from "./SupplyVdot.utils"
import { SupplyVdotSkeleton } from "./SupplyVdotSkeleton"

type SupplyVdotProps = {
  onSubmitted: () => void
}

/**
 * Supplies vDOT from the wallet, or mints it from DOT through Bifrost and supplies it.
 */
export const SupplyVdot: FC<SupplyVdotProps> = ({ onSubmitted }) => {
  const { getAsset, getRelatedAToken, isErc20AToken } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const { data: userBorrowData } = useUserBorrowSummary()

  const dot = getAsset(DOT_ASSET_ID)
  const vdot = getAsset(VDOT_ASSET_ID)
  const relatedAToken = getRelatedAToken(VDOT_ASSET_ID)
  const aToken =
    relatedAToken && isErc20AToken(relatedAToken) ? relatedAToken : undefined

  const selectableAssets = useAssetSelectModalAssets({
    assets: [dot, vdot].filter((asset) => !!asset),
    search: "",
  })

  const userReserve = userBorrowData?.userReservesData.find(
    (reserve) =>
      reserve.underlyingAsset === getAddressFromAssetId(VDOT_ASSET_ID),
  )

  if (
    !dot ||
    !vdot ||
    !aToken ||
    !userBorrowData ||
    !userReserve ||
    selectableAssets.isLoading
  )
    return <SupplyVdotSkeleton />

  const hasVdot = getTransferableBalance(VDOT_ASSET_ID) > 0n

  return (
    <SupplyVdotBody
      initialAsset={hasVdot ? vdot : dot}
      vdot={vdot}
      selectableAssets={selectableAssets.sortedAssets}
      aToken={aToken}
      userBorrowData={userBorrowData}
      userReserve={userReserve}
      onSubmitted={onSubmitted}
    />
  )
}

type SupplyVdotBodyProps = {
  initialAsset: TAssetData
  vdot: TAssetData
  selectableAssets: TAssetWithBalance[]
  aToken: TErc20AToken
  userBorrowData: ExtendedFormattedUser
  userReserve: ComputedUserReserveData
  onSubmitted: () => void
}

const SupplyVdotBody: FC<SupplyVdotBodyProps> = ({
  selectableAssets,
  ...props
}) => {
  const { t } = useTranslation(["common", "borrow"])
  const {
    form,
    isMint,
    maxBalance,
    onSubmit,
    apys,
    collateralType,
    healthFactor,
    isHealthFactorLoading,
    supplyCapWarning,
    isBlockedSupply,
    isQuoteLoading,
    isQuoted,
    suppliedHuman,
    routeFees,
    mintErrorMessage,
    isFeeShortfall,
  } = useSupplyVdot(props)

  const symbol = props.vdot.symbol
  const assetSymbol = form.watch("asset").symbol

  return (
    <FormProvider {...form}>
      <ModalHeader title={t("borrow:supply.withSymbol", { symbol })} closable />
      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
        <ModalBody>
          <Box pb="l">
            <AssetSelectFormField<SupplyVdotFormValues>
              label={t("amount")}
              assetFieldName="asset"
              amountFieldName="amount"
              sortedAssets={selectableAssets}
              assets={[]}
              balance={{ value: maxBalance }}
            />
          </Box>

          <ModalContentDivider />

          <Summary separator={<ModalContentDivider />}>
            {apys.map((apy, index) => (
              <SummaryRow
                key={index}
                label={getApyLabel(apy.apyType, true)}
                content={formatApyPercent(t, apy.apy)}
              />
            ))}
            <SummaryRow
              label={t("borrow:supply.vdot.supplied")}
              loading={isQuoteLoading}
              content={
                isQuoted ? t("currency", { value: suppliedHuman, symbol }) : "-"
              }
            />
            {isMint && (
              <SummaryRow
                label={t("borrow:supply.vdot.routeFees")}
                loading={isQuoteLoading}
                content={
                  routeFees
                    ? t("currency", { value: routeFees, symbol: assetSymbol })
                    : "-"
                }
              />
            )}
            {collateralType && (
              <SummaryRow
                label={t("borrow:collateral")}
                content={<CollateralState collateralType={collateralType} />}
              />
            )}
            {(healthFactor || isHealthFactorLoading) && (
              <SummaryRow
                label={t("healthFactor")}
                content={
                  healthFactor ? (
                    <HealthFactorChange
                      {...healthFactor}
                      loading={isHealthFactorLoading}
                      fontSize="p5"
                    />
                  ) : (
                    <Skeleton width={80} height="1em" />
                  )
                }
              />
            )}
            {(isMint || supplyCapWarning || isFeeShortfall) && (
              <Stack gap="s" py="l">
                {isMint && (
                  <Alert
                    variant={mintErrorMessage ? "error" : "info"}
                    description={
                      mintErrorMessage ??
                      t("borrow:supply.vdot.mintDescription", { symbol })
                    }
                  />
                )}
                {supplyCapWarning}
                {isFeeShortfall && (
                  <Alert
                    variant="warning"
                    description={t("borrow:supply.vdot.feeShortfall", {
                      symbol: assetSymbol,
                    })}
                  />
                )}
              </Stack>
            )}
          </Summary>

          <ModalContentDivider />
        </ModalBody>
        <ModalFooter sx={{ pt: 0 }}>
          <LoadingButton
            type="submit"
            size="large"
            width="100%"
            isLoading={isQuoteLoading && !!form.watch("amount")}
            disabled={
              isBlockedSupply ||
              !isQuoted ||
              isFeeShortfall ||
              !form.formState.isValid
            }
          >
            {t("borrow:supply.withSymbol", { symbol })}
          </LoadingButton>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
