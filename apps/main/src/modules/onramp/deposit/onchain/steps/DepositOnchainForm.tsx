import {
  AccountTile,
  Alert,
  Button,
  Flex,
  ModalBody,
  ModalHeader,
  Separator,
  Stack,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { getChainId, HYDRATION_PARACHAIN_ID } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useCrossChainBalance, useHydrationAssetId } from "@/api/xcm"
import { ChainLogo } from "@/components/ChainLogo"
import { canUseDepositAccount } from "@/modules/onramp/deposit/onchain/DepositOnchain.utils"
import { useOnrampClosable } from "@/modules/onramp/hooks/useOnrampClosable"
import {
  insertOptimisticJourney,
  removeOptimisticJourney,
} from "@/modules/xcm/history/utils/optimistic"
import {
  AmountFormField,
  ChainAssetFormField,
} from "@/modules/xcm/transfer/components/FormField"
import { RecipientSelectModal } from "@/modules/xcm/transfer/components/Recipient"
import { useResetAmounts } from "@/modules/xcm/transfer/hooks/useResetAmounts"
import { useSubmitXcmTransfer } from "@/modules/xcm/transfer/hooks/useSubmitXcmTransfer"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  BRIDGE_TIME,
  getPrimaryBridgeTag,
  isOmniRoute,
} from "@/modules/xcm/transfer/utils/bridge"
import { XcmFooter } from "@/modules/xcm/transfer/XcmFooter"
import { XcmSummary } from "@/modules/xcm/transfer/XcmSummary"
import { useAssetPrice } from "@/states/displayAsset"

export type DepositOnchainFormProps = {
  onBack: () => void
  onSubmitted: (values: XcmFormValues) => void
}

const getRecipientAddress = ({ destAccount, destAddress }: XcmFormValues) =>
  destAccount?.rawAddress ?? destAddress

type AccountTileActionProps = {
  label: string
  disabled: boolean
  onClick: () => void
}

const AccountTileAction: FC<AccountTileActionProps> = ({
  label,
  disabled,
  onClick,
}) => (
  <Button
    type="button"
    variant="secondary"
    outline
    size="small"
    disabled={disabled}
    onClick={onClick}
  >
    {label}
  </Button>
)

export const DepositOnchainForm: React.FC<DepositOnchainFormProps> = ({
  onBack,
  onSubmitted,
}) => {
  const { t } = useTranslation(["onramp", "common", "xcm"])
  const closable = useOnrampClosable()
  const { account } = useAccount()
  const {
    transfer,
    selectedRoute,
    sourceChainAssetPairs,
    isLoadingSrcBalances,
    isConnectedAccountValid,
  } = useXcmProvider()
  const { watch, handleSubmit, setValue } = useFormContext<XcmFormValues>()
  const resetAmounts = useResetAmounts()
  const queryClient = useQueryClient()
  const submit = useSubmitXcmTransfer({
    onTransferSubmitted: (txHash, values, transfer) => {
      insertOptimisticJourney(
        queryClient,
        getRecipientAddress(values),
        txHash,
        values,
        transfer,
      )
      void resetAmounts()
      onSubmitted(values)
    },
    onTransferError: (txHash, values) => {
      removeOptimisticJourney(queryClient, getRecipientAddress(values), txHash)
    },
  })

  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false)

  const [srcChain, srcAsset, destAsset, destAddress, destAccount, destAmount] =
    watch([
      "srcChain",
      "srcAsset",
      "destAsset",
      "destAddress",
      "destAccount",
      "destAmount",
    ])

  const srcAddress = isConnectedAccountValid ? (account?.address ?? "") : ""
  const srcChainKey = srcChain?.key ?? ""
  const { data: srcBalances } = useCrossChainBalance(srcAddress, srcChainKey)

  const getHydrationAssetId = useHydrationAssetId()
  const { price } = useAssetPrice(
    srcAsset
      ? (getHydrationAssetId(srcAsset, srcChainKey) ?? undefined)
      : undefined,
  )

  const bridgeTag =
    selectedRoute && !isOmniRoute(selectedRoute)
      ? getPrimaryBridgeTag(selectedRoute)
      : null
  const estimatedTime = bridgeTag ? BRIDGE_TIME[bridgeTag] : undefined
  const isTooSmall =
    !!transfer && transfer.source.max.toBig().lt(transfer.source.min.toBig())
  const fallbackRecipientName = destAddress
    ? t("xcm:recipient.input.customWallet")
    : t("deposit.onchain.noAccount")

  return (
    <form
      onSubmit={handleSubmit(
        (values) => transfer && submit.mutate([values, transfer]),
      )}
    >
      <ModalHeader
        title={t("deposit.onchain.title")}
        align="center"
        onBack={onBack}
        closable={closable}
      />
      <Separator />
      <ModalBody noPadding scrollable={false}>
        <Stack px={["l", "xl"]} py={["m", "l"]} gap="s">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.quick.sourceWallet")}
          </Text>
          {account && (
            <AccountTile
              name={account.name}
              address={account.displayAddress}
              action={
                <AccountTileAction
                  label={t("common:change")}
                  disabled={submit.isPending}
                  onClick={onBack}
                />
              }
            />
          )}
        </Stack>
        <Separator />
        <Stack px={["l", "xl"]} py={["m", "l"]} gap="base">
          <Flex justify="space-between" gap="base">
            <Flex
              direction="column"
              gap="base"
              position="relative"
              pt={pxToRem(26)}
            >
              <Flex
                align="center"
                gap="s"
                position="absolute"
                sx={{ top: 0, left: 0 }}
              >
                <Text
                  fs="p5"
                  color={getToken("text.medium")}
                  whiteSpace="nowrap"
                >
                  {t("common:from")}
                </Text>
                {srcChain && (
                  <>
                    <ChainLogo
                      ecosystem={srcChain.ecosystem}
                      chainId={getChainId(srcChain)}
                      size="extra-small"
                    />
                    <Text
                      fs="p5"
                      fw={500}
                      color={getToken("text.high")}
                      whiteSpace="nowrap"
                    >
                      {srcChain.name}
                    </Text>
                  </>
                )}
              </Flex>
              <ChainAssetFormField
                fieldName="srcAsset"
                chainFieldName="srcChain"
                type="source"
                address={srcAddress}
                chainAssetPairs={sourceChainAssetPairs.filter(({ chain }) =>
                  canUseDepositAccount(account, chain),
                )}
                onAssetChange={resetAmounts}
              />
            </Flex>
            <AmountFormField
              fieldName="srcAmount"
              balance={srcBalances?.get(srcAsset?.key ?? "")}
              balanceMax={transfer?.source.max}
              withMaxButton
              disabled={
                !srcAsset ||
                !destAddress ||
                isTooSmall ||
                !isConnectedAccountValid ||
                isLoadingSrcBalances
              }
              isLoading={isLoadingSrcBalances}
              isBalanceLoading={isLoadingSrcBalances}
              assetPrice={price}
            />
          </Flex>
          {isTooSmall && (
            <Alert
              variant="warning"
              description={t("deposit.onchain.tooSmall", {
                amount: transfer.source.min.toDecimal(),
                symbol: transfer.source.min.originSymbol,
              })}
            />
          )}
        </Stack>
        <Separator />
        <Stack px={["l", "xl"]} py={["m", "l"]} gap="s">
          <Flex align="center" gap="s">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("common:to")}
            </Text>
            <ChainLogo
              chainId={HYDRATION_PARACHAIN_ID}
              size="extra-small"
              alt="Hydration"
            />
            <Text fs="p5" fw={500} color={getToken("text.high")}>
              Hydration
            </Text>
          </Flex>
          <AccountTile
            name={destAccount?.name ?? fallbackRecipientName}
            address={destAddress}
            action={
              <AccountTileAction
                label={destAddress ? t("common:change") : t("common:select")}
                disabled={submit.isPending}
                onClick={() => setIsRecipientModalOpen(true)}
              />
            }
          />
          <RecipientSelectModal
            open={isRecipientModalOpen}
            onClose={() => setIsRecipientModalOpen(false)}
            onSelectAddress={(address, recipient) => {
              setValue("destAddress", address, { shouldValidate: true })
              setValue("destAccount", recipient ?? null)
              setIsRecipientModalOpen(false)
            }}
          />
        </Stack>
        <XcmSummary>
          {destAsset && (
            <SummaryRow
              label={t("transferSummary.receive")}
              content={
                destAmount
                  ? t("common:currency", {
                      value: destAmount,
                      symbol: destAsset.originSymbol,
                    })
                  : null
              }
            />
          )}
          {estimatedTime && (
            <SummaryRow
              label={t("transferSummary.time")}
              content={estimatedTime}
            />
          )}
        </XcmSummary>
        <Separator />
        <XcmFooter
          isSubmitting={submit.isPending}
          submitLabel={t("deposit.onchain.confirm")}
        />
      </ModalBody>
    </form>
  )
}
