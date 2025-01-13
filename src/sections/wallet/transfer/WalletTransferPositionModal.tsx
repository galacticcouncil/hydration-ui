import { AddressBook } from "components/AddressBook/AddressBook"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { H160, safeConvertAddressH160 } from "utils/evm"
import { FormValues } from "utils/helpers"
import {
  CloseIcon,
  PasteAddressIcon,
} from "./onchain/WalletTransferSectionOnchain.styled"
import { WalletTransferAccountInput } from "./WalletTransferAccountInput"
import CrossIcon from "assets/icons/CrossIcon.svg?react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { getDestZodSchema } from "./onchain/WalletTransferSectionOnchain.utils"
import { SContainer } from "components/AssetSelect/AssetSelect.styled"
import { Text } from "components/Typography/Text/Text"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { TLPData } from "utils/omnipool"
import { Icon } from "components/Icon/Icon"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { SDollars } from "components/AssetInput/AssetInput.styled"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Separator } from "components/Separator/Separator"
import { Button } from "components/Button/Button"
import { useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"
import { createToastMessages } from "state/toasts"
import { useRefetchAccountAssets } from "api/deposits"
import {
  getChainSpecificAddress,
  shortenAccountAddress,
} from "utils/formatting"
import {
  isXYKPosition,
  TXYKPosition,
} from "sections/wallet/assets/farmingPositions/WalletFarmingPositions.utils"
import { ReactElement } from "react"
import { useAssets } from "providers/assets"

enum ModalPage {
  Transfer,
  AddressBook,
}

const LP_COLLECTION_ID = "1337"
const FARM_COLLECTION_ID = "2584"
const XYK_FARM_COLLECTION_ID = "5389"

export const WalletTransferPositionModal = ({
  position,
  onClose,
  isFarmingPosition,
}: {
  position: TLPData | TXYKPosition
  onClose: () => void
  isFarmingPosition?: boolean
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { api } = useRpcProvider()
  const refetch = useRefetchAccountAssets()
  const { getAsset } = useAssets()

  const isXyk = isXYKPosition(position)

  const { createTransaction } = useStore()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { page, direction, paginateTo, back } = useModalPagination()

  const form = useForm<{ dest: string; amount: string }>({
    resolver: zodResolver(getDestZodSchema(account?.address)),
  })

  const iconIds = isXyk
    ? [position.balances[0].id, position.balances[1].id]
    : position.meta.iconId

  let displayedValueComp: ReactElement | undefined = undefined

  if (isXyk) {
    displayedValueComp = (
      <div sx={{ flex: "row", gap: 4 }}>
        <Text fs={14} lh={14} fw={500} color="white" tAlign={["right", "left"]}>
          {position.balances
            .map((balance) =>
              t("value.tokenWithSymbol", {
                value: balance.amount,
                symbol: balance.symbol,
              }),
            )
            .join(" | ")}
        </Text>
      </div>
    )
  } else {
    const { lrnaShifted, valueShifted, meta } = position

    const tKey =
      lrnaShifted && !lrnaShifted.isNaN() && lrnaShifted.gt(0)
        ? "wallet.assets.hydraPositions.data.valueLrna"
        : "wallet.assets.hydraPositions.data.value"

    displayedValueComp = (
      <Trans
        i18nKey={tKey}
        tOptions={{
          value: valueShifted,
          symbol: meta?.symbol,
          lrna: lrnaShifted,
          type: "token",
        }}
      >
        <br sx={{ display: ["initial", "none"] }} />
      </Trans>
    )
  }

  const onSubmit = async (values: FormValues<typeof form>) => {
    const normalizedDest =
      safeConvertAddressH160(values.dest) !== null
        ? new H160(values.dest).toAccount()
        : values.dest

    const toast = createToastMessages("wallet.assets.transfer.position.toast", {
      t,
      tOptions: {
        value: isXyk
          ? position.balances
              .map((balance) =>
                t("value.tokenWithSymbol", {
                  value: balance.amount,
                  symbol: balance.symbol,
                }),
              )
              .join(" | ")
          : t("wallet.assets.hydraPositions.data.value", {
              value: position.totalValueShifted,
              symbol: position.meta?.symbol,
            }),
        address: shortenAccountAddress(
          getChainSpecificAddress(normalizedDest),
          12,
        ),
      },
      components: ["span", "span.highlight"],
    })

    return await createTransaction(
      {
        tx: api.tx.uniques.transfer(
          isFarmingPosition
            ? isXyk
              ? XYK_FARM_COLLECTION_ID
              : FARM_COLLECTION_ID
            : LP_COLLECTION_ID,
          position.id,
          normalizedDest,
        ),
      },
      { onClose, onBack: () => {}, toast, onSuccess: refetch },
    )
  }

  return (
    <Modal open onClose={onClose} disableClose={!isDesktop}>
      <ModalContents
        page={page}
        direction={direction}
        onClose={onClose}
        onBack={back}
        disableAnimation
        contents={[
          {
            title: t("wallet.assets.transfer.position.title"),
            content: (
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                autoComplete="off"
                sx={{
                  flex: "column",
                  justify: "space-between",
                  minHeight: "100%",
                }}
              >
                <div sx={{ flex: "column", gap: 12 }}>
                  <Controller
                    name="dest"
                    control={form.control}
                    render={({
                      field: { name, onChange, value, onBlur },
                      fieldState: { error },
                    }) => {
                      const rightIcon = value ? (
                        <CloseIcon
                          icon={<CrossIcon />}
                          onClick={() => onChange("")}
                          name={t("modal.closeButton.name")}
                        />
                      ) : (
                        <PasteAddressIcon
                          onClick={async () => {
                            const text = await navigator.clipboard.readText()
                            onChange(text)
                          }}
                        />
                      )

                      return (
                        <WalletTransferAccountInput
                          label={t("wallet.assets.transfer.dest.label")}
                          name={name}
                          value={value}
                          onChange={onChange}
                          placeholder={t(
                            "wallet.assets.transfer.dest.placeholder",
                          )}
                          rightIcon={rightIcon}
                          onBlur={onBlur}
                          error={error?.message}
                          openAddressBook={() =>
                            paginateTo(ModalPage.AddressBook)
                          }
                        />
                      )
                    }}
                  />

                  <SContainer>
                    <Text
                      fw={500}
                      fs={11}
                      lh={22}
                      tTransform="uppercase"
                      color="whiteish500"
                    >
                      {t("wallet.assets.transfer.position.label")}
                    </Text>
                    <div
                      sx={{
                        flex: "row",
                        align: "center",
                        justify: "space-between",
                        gap: [12, 0],
                        mt: [16, 0],
                        py: 6,
                      }}
                    >
                      <div sx={{ flex: "row", gap: 8, align: "center" }}>
                        {typeof iconIds === "string" ? (
                          <Icon icon={<AssetLogo id={iconIds} />} size={30} />
                        ) : (
                          <MultipleIcons
                            icons={iconIds.map((asset) => ({
                              icon: <AssetLogo key={asset} id={asset} />,
                            }))}
                          />
                        )}
                        <Text fs={14} tTransform="uppercase" color="white">
                          {isXyk
                            ? getAsset(position.assetId)?.symbol
                            : position.meta.symbol}
                        </Text>
                      </div>

                      <div sx={{ flex: "column", gap: 2, align: "end" }}>
                        <Text fs={16} tTransform="uppercase" color="white">
                          {displayedValueComp}
                        </Text>
                        <SDollars>
                          ≈ <DisplayValue value={position.valueDisplay} />
                        </SDollars>
                      </div>
                    </div>
                  </SContainer>
                </div>
                <div>
                  <Separator color="darkBlue401" sx={{ mt: 31 }} />
                  <div sx={{ flex: "row", justify: "space-between", mt: 20 }}>
                    <Button onClick={onClose}>
                      {t("wallet.assets.transfer.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!!Object.keys(form.formState.errors).length}
                    >
                      {t("wallet.assets.transfer.submit")}
                    </Button>
                  </div>
                </div>
              </form>
            ),
          },
          {
            title: t("addressbook.title"),
            content: (
              <AddressBook
                onSelect={(address) => {
                  form.setValue("dest", address, { shouldValidate: true })
                  paginateTo(ModalPage.Transfer)
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
