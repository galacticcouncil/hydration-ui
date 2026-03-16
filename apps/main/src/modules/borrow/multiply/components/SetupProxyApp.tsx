import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import {
  Alert,
  Button,
  Paper,
  Separator,
  Stack,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { createProxyFeesQuery, useAccountProxies } from "@/api/proxy"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  TSetupProxyFormValues,
  useSetupProxy,
} from "@/modules/borrow/hooks/useSetupProxy"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type SetupProxyAppWrapperProps = {
  collateralReserve: ComputedReserveData
}

export type SetupProxyAppProps = SetupProxyAppWrapperProps & {
  proxies: Array<string>
  proxyCreationFee: bigint
}

const SectionSeparator = () => <Separator sx={{ mx: "-xl" }} />

export const SetupProxyAppWapper = ({
  collateralReserve,
}: SetupProxyAppWrapperProps) => {
  const rpc = useRpcProvider()
  const { data: proxies = [], isLoading: isProxiesLoading } =
    useAccountProxies()
  const { data: proxyFees } = useQuery(createProxyFeesQuery(rpc))

  if (isProxiesLoading || !proxyFees) {
    return <SetupProxyAppSkeleton />
  }

  const proxyCreationFee =
    proxyFees.proxyDepositBase +
    proxyFees.proxyDepositFactor * BigInt(proxies.length)

  return (
    <SetupProxyApp
      collateralReserve={collateralReserve}
      proxies={proxies}
      proxyCreationFee={proxyCreationFee}
    />
  )
}

export const SetupProxyAppSkeleton = () => (
  <Stack gap="s" as={Paper} p="xl">
    <AssetSelect
      label="Select asset"
      disabled
      loading
      assets={[]}
      selectedAsset={undefined}
    />

    <SectionSeparator />

    <SummaryRow label="Minimum received" content="" loading />

    <SectionSeparator />

    <Button type="button" width="100%" size="large" sx={{ mt: "xl" }} disabled>
      Setup proxy
    </Button>
  </Stack>
)

export const SetupProxyApp = ({
  collateralReserve,
  proxies,
  proxyCreationFee,
}: SetupProxyAppProps) => {
  const { native } = useAssets()
  const { t } = useTranslation("common")
  const { form, onSubmit, minReceiveAmountShifted, aTokenMeta } = useSetupProxy(
    {
      collateralReserve,
      proxies,
      proxyCreationFee,
    },
  )

  const feeError = form.formState.errors.fee?.message

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
        <Stack gap="s" as={Paper} p="xl">
          <AssetSelectFormField<TSetupProxyFormValues>
            label="Select asset"
            assetFieldName="asset"
            amountFieldName="amount"
            assets={[]}
            disabledAssetSelector
            sx={{ pt: 0 }}
          />

          <SectionSeparator />

          <Summary
            separator={<SectionSeparator />}
            rows={[
              {
                label: "Minimum received",
                content: t("currency", {
                  value: minReceiveAmountShifted,
                  symbol: aTokenMeta?.symbol,
                }),
              },

              {
                label: "Create proxy fee",
                content: t("currency", {
                  value: scaleHuman(proxyCreationFee, native.decimals),
                  symbol: native.symbol,
                }),
              },
            ]}
          />

          <SectionSeparator />

          {feeError && (
            <>
              <Alert variant="error" description={feeError} />{" "}
              <SectionSeparator />
            </>
          )}

          <Button
            type="submit"
            width="100%"
            size="large"
            sx={{ mt: "xl" }}
            disabled={!form.formState.isValid}
          >
            Setup proxy
          </Button>
        </Stack>
      </form>
    </FormProvider>
  )
}
