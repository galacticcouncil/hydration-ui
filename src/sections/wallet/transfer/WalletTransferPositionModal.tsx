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
import { useRefetchAccountNFTPositions } from "api/deposits"
import {
  getChainSpecificAddress,
  shortenAccountAddress,
} from "utils/formatting"

enum ModalPage {
  Transfer,
  AddressBook,
}

export const WalletTransferPositionModal = ({
  position,
  onClose,
}: {
  position: TLPData
  onClose: () => void
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { api } = useRpcProvider()
  const refetch = useRefetchAccountNFTPositions()

  const { createTransaction } = useStore()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { page, direction, paginateTo, back } = useModalPagination()

  const form = useForm<{ dest: string; amount: string }>({
    resolver: zodResolver(getDestZodSchema(account?.address)),
  })

  const { lrnaShifted, valueShifted, meta, valueDisplay, totalValueShifted } =
    position

  const tKey =
    lrnaShifted && !lrnaShifted.isNaN() && lrnaShifted.gt(0)
      ? "wallet.assets.hydraPositions.data.valueLrna"
      : "wallet.assets.hydraPositions.data.value"

  const onSubmit = async (values: FormValues<typeof form>) => {
    const normalizedDest =
      safeConvertAddressH160(values.dest) !== null
        ? new H160(values.dest).toAccount()
        : values.dest

    const toast = createToastMessages("wallet.assets.transfer.position.toast", {
      t,
      tOptions: {
        value: t("wallet.assets.hydraPositions.data.value", {
          value: totalValueShifted,
          symbol: meta?.symbol,
        }),
        address: shortenAccountAddress(
          getChainSpecificAddress(normalizedDest),
          12,
        ),
      },
      components: ["span.highlight"],
    })

    return await createTransaction(
      {
        tx: api.tx.uniques.transfer("1337", position.id, normalizedDest),
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
                        {typeof position.meta.iconId === "string" ? (
                          <Icon
                            icon={<AssetLogo id={position.meta.iconId} />}
                            size={30}
                          />
                        ) : (
                          <MultipleIcons
                            icons={position.meta.iconId.map((asset) => ({
                              icon: <AssetLogo key={asset} id={asset} />,
                            }))}
                          />
                        )}
                        <Text fs={14} tTransform="uppercase" color="white">
                          {meta.symbol}
                        </Text>
                      </div>

                      <div sx={{ flex: "column", gap: 2, align: "end" }}>
                        <Text fs={16} tTransform="uppercase" color="white">
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
                        </Text>
                        <SDollars>
                          ≈ <DisplayValue value={valueDisplay} />
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
