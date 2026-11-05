import {
  ModalContentDivider,
  Stack,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { isValidBigSource, normalizeSS58Address } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { TransferPositionFormValues } from "@/modules/portfolio/overview/Transfer/TransferPosition.form"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scale } from "@/utils/formatting"

type Props = TransferPositionFormValues & {
  readonly isSourceCurrent: boolean
}

export const TransferPositionSummary = ({
  asset,
  amount,
  address,
  isSourceCurrent,
}: Props) => {
  const { t } = useTranslation(["onramp", "common"])
  const { account } = useAccount()
  const { papi } = useRpcProvider()
  const { getAsset, isErc20 } = useAssets()
  const destination = normalizeSS58Address(address)
  const hasDetails =
    !!asset && !!destination && isValidBigSource(amount) && Big(amount).gt(0)

  const tx = useMemo(() => {
    if (!hasDetails || !asset || !isSourceCurrent || account?.isMultisig)
      return null

    const rawAmount = BigInt(scale(amount, asset.decimals))
    if (rawAmount <= 0n) return null

    const transfer = papi.tx.Currencies.transfer({
      currency_id: Number(asset.id),
      dest: destination,
      amount: rawAmount,
    })

    // Match the extra-gas wrapper used by transaction review for ERC-20 assets.
    return isErc20(asset)
      ? papi.tx.Dispatcher.dispatch_with_extra_gas({
          call: transfer.decodedCall,
          extra_gas: AAVE_GAS_LIMIT,
        })
      : transfer
  }, [
    account?.isMultisig,
    amount,
    asset,
    destination,
    hasDetails,
    isErc20,
    isSourceCurrent,
    papi,
  ])

  const fee = useEstimateFee(tx)
  const feeAsset = fee.data?.feeAssetId
    ? getAsset(fee.data.feeAssetId)
    : undefined
  const feeEstimate = fee.data?.feeEstimate
  const canShowFee =
    !!tx &&
    !fee.isPlaceholderData &&
    !fee.isError &&
    !!feeAsset &&
    isValidBigSource(feeEstimate) &&
    Big(feeEstimate).gt(0)
  const isLoadingFee = !!tx && fee.isFetching && !fee.isError && !canShowFee

  if (!canShowFee && !isLoadingFee) return null

  return (
    <>
      <Stack gap="s" py="m">
        <Summary separated={false}>
          <SummaryRow
            label={t("transferSummary.networkFee")}
            loading={isLoadingFee}
            content={
              <Text fs="p5" fw={500} align="right">
                {canShowFee && feeAsset && feeEstimate
                  ? `${t("common:approx.short")} ${t("common:currency", {
                      value: feeEstimate,
                      symbol: feeAsset.symbol,
                    })}`
                  : null}
              </Text>
            }
          />
        </Summary>
      </Stack>
      <ModalContentDivider />
    </>
  )
}
