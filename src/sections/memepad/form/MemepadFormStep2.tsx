import { useCrossChainTransfer } from "api/xcm"
import { FC, useState } from "react"
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
import { BN_NAN } from "utils/constants"
import { AddressBook } from "components/AddressBook/AddressBook"
import { Modal } from "components/Modal/Modal"

type MemepadFormStep2Props = {
  form: UseFormReturn<MemepadStep2Values>
  assetId: string
  assetKey: string
  srcAddress: string
}

export const MemepadFormStep2: FC<MemepadFormStep2Props> = ({
  form,
  assetId,
  assetKey,
  srcAddress,
}) => {
  const { t } = useTranslation()
  const [addressBookOpen, setAddressBookOpen] = useState(false)

  const openAddressBook = () => setAddressBookOpen(true)
  const closeAddressBook = () => setAddressBookOpen(false)

  const destAddress = form.watch("hydrationAddress")

  const { data: transfer } = useCrossChainTransfer({
    asset: assetKey,
    srcAddr: srcAddress,
    srcChain: MEMEPAD_XCM_SRC_CHAIN,
    dstAddr: destAddress,
    dstChain: MEMEPAD_XCM_DST_CHAIN,
  })

  const balance = BN(transfer?.balance?.amount?.toString() ?? "0")
  const balanceMax = BN(transfer?.max?.amount?.toString() ?? "0")

  const srcFee = BN(transfer?.srcFee?.amount?.toString() ?? BN_NAN).shiftedBy(
    -(transfer?.srcFee?.decimals ?? 0),
  )

  const dstFee = BN(transfer?.dstFee?.amount?.toString() ?? BN_NAN).shiftedBy(
    -(transfer?.dstFee?.decimals ?? 0),
  )

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
                maxBalance: (value) =>
                  BN(value)
                    .shiftedBy(transfer?.max?.decimals ?? 0)
                    .lte(balanceMax) ||
                  t("wallet.addToken.form.error.maxTransferable", {
                    value: balanceMax,
                    fixedPointScale: transfer?.max?.decimals,
                    symbol: transfer?.balance?.symbol,
                  }),
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <WalletTransferAssetSelect
                title={t("wallet.addToken.form.amount")}
                asset={assetId}
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
                label={t("wallet.addToken.form.hydrationAddress")}
                error={error?.message}
                openAddressBook={openAddressBook}
                {...field}
              />
            )}
          />
        </div>
      </form>
      <Text fs={14} sx={{ flex: "row", justify: "space-between", mt: 10 }}>
        <span sx={{ color: "basic400" }}>Source fee:</span>
        <span>
          {t("value.tokenWithSymbol", {
            value: srcFee,
            symbol: transfer?.srcFee?.symbol,
          })}
        </span>
      </Text>
      <Text fs={14} sx={{ flex: "row", justify: "space-between", mt: 10 }}>
        <span sx={{ color: "basic400" }}>Destination fee:</span>
        <span>
          {t("value.tokenWithSymbol", {
            value: dstFee,
            symbol: transfer?.dstFee?.symbol,
          })}
        </span>
      </Text>
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
