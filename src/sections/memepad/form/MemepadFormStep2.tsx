import { createXcmAssetKey, useCrossChainTransfer } from "api/xcm"
import { FC, useEffect, useState } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import {
  MEMEPAD_XCM_DST_CHAIN,
  MEMEPAD_XCM_SRC_CHAIN,
  MemepadStep2Values,
} from "./MemepadForm.utils"
import BN from "bignumber.js"
import { Text } from "components/Typography/Text/Text"
import { BN_0, BN_NAN } from "utils/constants"
import { AddressBook } from "components/AddressBook/AddressBook"
import { Modal } from "components/Modal/Modal"
import { SRowItem } from "sections/memepad/components/MemepadSummary"
import { useMemepadFormContext } from "./MemepadFormContext"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { Parachain } from "@galacticcouncil/xcm-core"
import {
  useAssetHubExistentialDeposit,
  useAssetHubTokenBalance,
} from "api/external/assethub"

const ALLOW_ADDRESSBOOK = false

type MemepadFormStep2Props = {
  form: UseFormReturn<MemepadStep2Values>
}

export const MemepadFormStep2: FC<MemepadFormStep2Props> = ({ form }) => {
  const { t } = useTranslation()
  const [addressBookOpen, setAddressBookOpen] = useState(false)
  const { summary, setAlert, clearAlert } = useMemepadFormContext()

  const srcAddress = summary?.account ?? ""
  const internalId = summary?.internalId ?? ""
  const xcmAssetKey = createXcmAssetKey(
    summary?.id ?? "",
    summary?.symbol ?? "",
  )

  const openAddressBook = () => setAddressBookOpen(true)
  const closeAddressBook = () => setAddressBookOpen(false)

  const destAddress = form.watch("hydrationAddress")

  const srcChain = chainsMap.get(MEMEPAD_XCM_SRC_CHAIN) as Parachain
  const dstChain = chainsMap.get(MEMEPAD_XCM_DST_CHAIN) as Parachain

  const { data: transfer } = useCrossChainTransfer({
    asset: xcmAssetKey,
    srcAddr: srcAddress,
    srcChain: srcChain.key,
    dstAddr: destAddress,
    dstChain: dstChain.key,
  })

  const balance = BN(transfer?.balance?.amount?.toString() ?? "0")
  const balanceMax = BN(transfer?.max?.amount?.toString() ?? "0")
  const balanceMin = BN(transfer?.min?.amount?.toString() ?? "0")

  const srcFeeDecimals = transfer?.srcFee?.decimals ?? 0
  const dstFeeDecimals = transfer?.dstFee?.decimals ?? 0

  const srcFee = BN(transfer?.srcFee?.amount?.toString() ?? BN_NAN).shiftedBy(
    -srcFeeDecimals,
  )

  const dstFee = BN(transfer?.dstFee?.amount?.toString() ?? BN_NAN).shiftedBy(
    -dstFeeDecimals,
  )

  const dstChainFeeAssetId = transfer?.dstFee
    ? dstChain.getAssetId(transfer?.dstFee)
    : ""

  const { data: dstFeeBalanceData, isSuccess: isDstFeeBalanceSuccess } =
    useAssetHubTokenBalance(
      summary?.account ?? "",
      dstChainFeeAssetId.toString(),
    )

  const { data: ed, isSuccess: isEdSuccess } = useAssetHubExistentialDeposit(
    dstChainFeeAssetId.toString(),
  )

  const dstEd = (ed ?? BN_0).shiftedBy(-dstFeeDecimals)
  const dstFeeBalance = (dstFeeBalanceData?.balance ?? BN_0).shiftedBy(
    -dstFeeDecimals,
  )
  const minDstFeeBalance = dstFee.plus(dstEd)

  const dstFeeAlert =
    isEdSuccess && isDstFeeBalanceSuccess && dstFeeBalance.lt(minDstFeeBalance)
      ? t("memepad.form.error.dstFee", {
          value: minDstFeeBalance,
          symbol: transfer?.dstFee?.symbol,
          chain: srcChain.name,
        })
      : null

  useEffect(() => {
    if (dstFeeAlert) {
      setAlert({
        key: "xcmDstFee",
        variant: "error",
        text: dstFeeAlert,
      })
    } else {
      clearAlert("xcmDstFee")
    }
  }, [clearAlert, dstFeeAlert, setAlert])

  return (
    <>
      <form autoComplete="off">
        <div sx={{ flex: "column", gap: 8 }}>
          <Controller
            name="amount"
            control={form.control}
            rules={{
              required: t("error.required"),
              validate: {
                positive: (value) => BN(value).gt(0) || t("error.positive"),
                minBalance: (value) =>
                  BN(value)
                    .shiftedBy(transfer?.min?.decimals ?? 0)
                    .gte(balanceMin) ||
                  t("memepad.form.error.minTransferable", {
                    value: balanceMin,
                    fixedPointScale: transfer?.min?.decimals,
                    symbol: transfer?.balance?.symbol,
                  }),
                maxBalance: (value) =>
                  BN(value)
                    .shiftedBy(transfer?.max?.decimals ?? 0)
                    .lte(balanceMax) ||
                  t("memepad.form.error.maxTransferable", {
                    value: balanceMax,
                    fixedPointScale: transfer?.max?.decimals,
                    symbol: transfer?.balance?.symbol,
                  }),
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <WalletTransferAssetSelect
                title={t("memepad.form.amount")}
                asset={internalId}
                error={error?.message}
                balance={balance}
                balanceMax={balanceMax}
                {...field}
              />
            )}
          />
          <Controller
            name="hydrationAddress"
            control={form.control}
            rules={{
              required: t("error.required"),
            }}
            render={({ field, fieldState: { error } }) => (
              <WalletTransferAccountInput
                label={t("memepad.form.hydrationAddress")}
                error={error?.message}
                openAddressBook={
                  ALLOW_ADDRESSBOOK ? openAddressBook : undefined
                }
                {...field}
                css={!ALLOW_ADDRESSBOOK && { pointerEvents: "none" }}
              />
            )}
          />
        </div>
      </form>

      <SRowItem sx={{ mt: 10 }}>
        <Text fs={14} color="basic400">
          {t("liquidity.reviewTransaction.modal.detail.srcChainFee")}
        </Text>
        <Text fs={14}>
          {t("value.tokenWithSymbol", {
            value: srcFee,
            symbol: transfer?.srcFee?.symbol,
          })}
        </Text>
      </SRowItem>
      <SRowItem css={{ border: "none" }}>
        <Text fs={14} color="basic400">
          {t("liquidity.reviewTransaction.modal.detail.dstChainFee")}
        </Text>
        <Text fs={14}>
          {t("value.tokenWithSymbol", {
            value: dstFee,
            symbol: transfer?.dstFee?.symbol,
          })}
        </Text>
      </SRowItem>

      <Modal
        open={addressBookOpen}
        onClose={closeAddressBook}
        title={t("addressbook.title")}
      >
        <AddressBook
          onSelect={(address) => {
            form.setValue("hydrationAddress", address)
            closeAddressBook()
          }}
        />
      </Modal>
    </>
  )
}
