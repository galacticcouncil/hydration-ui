import { Button } from "components/Button/Button"
import { FC } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  PARACHAIN_CONFIG,
  TExternalAsset,
  useRegisterToken,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { SInput } from "./AddTokenFormModal.styled"
import { FormValues } from "utils/helpers"

import DropletIcon from "assets/icons/DropletIcon.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { useRpcProvider } from "providers/rpcProvider"
import { Spacer } from "components/Spacer/Spacer"
import { useToast } from "state/toasts"
import { Text } from "components/Typography/Text/Text"

type Props = {
  asset: TExternalAsset
  onClose: () => void
}

type FormFields = {
  multilocation: (typeof PARACHAIN_CONFIG)[number]
  name: string
  decimals: string
  symbol: string
}

export const AddTokenFormModal: FC<Props> = ({ asset, onClose }) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const mutation = useRegisterToken()
  const { addToken } = useUserExternalTokenStore()
  const { add } = useToast()

  const isChainStored = assets.external.some(
    (chainAsset) => chainAsset.generalIndex === asset.id,
  )

  const form = useForm<FormFields>({
    mode: "onSubmit",
    defaultValues: {
      name: asset.name,
      symbol: asset.symbol,
      decimals: asset.decimals.toString(),
      multilocation: asset.parachainId
        ? PARACHAIN_CONFIG[asset.parachainId.toString()]
        : {},
    },
  })

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (!asset) throw new Error("Selected asset cannot be added")

    const { parents, palletInstance } = values.multilocation

    const response = await mutation.mutate({
      parents,
      interior: {
        X3: [
          {
            Parachain: asset.parachainId.toString(),
          },
          {
            PalletInstance: palletInstance,
          },
          {
            GeneralIndex: asset.id,
          },
        ],
      },
    })
    console.log(response)
  }

  const hasAsset = !!asset

  const onAddTokenToUser = (asset: TExternalAsset) => {
    addToken(asset)
    add("success", { title: <Text>You added a token</Text> })
    onClose()
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      autoComplete="off"
      sx={{ height: "100%" }}
    >
      <div sx={{ flex: "column", gap: 8, height: "100%" }}>
        {/* <Controller
          name="multilocation"
          control={form.control}
          render={({ field }) => (
            <>
              <SLabel>
                <span>{t("wallet.addToken.form.multilocation.label")}</span>
                <STextarea
                  autoComplete="off"
                  rows={5}
                  placeholder={t(
                    "wallet.addToken.form.multilocation.placeholder",
                  )}
                  {...field}
                />
              </SLabel>
            </>
          )}
        /> */}
        <Controller
          name="name"
          control={form.control}
          render={({ field }) => (
            <SInput
              autoComplete="off"
              placeholder={t("wallet.addToken.form.name.placeholder")}
              {...field}
              disabled={hasAsset}
            />
          )}
        />
        <Controller
          name="symbol"
          control={form.control}
          render={({ field }) => (
            <SInput
              autoComplete="off"
              placeholder={t("wallet.addToken.form.symbol.placeholder")}
              {...field}
              disabled={hasAsset}
            />
          )}
        />
        <Controller
          name="decimals"
          control={form.control}
          render={({ field }) => (
            <SInput
              autoComplete="off"
              placeholder={t("wallet.addToken.form.decimals.placeholder")}
              {...field}
              disabled={hasAsset}
            />
          )}
        />

        <Spacer size={24} />

        {isChainStored ? (
          <Button
            type="button"
            variant="primary"
            onClick={() => onAddTokenToUser(asset)}
          >
            <PlusIcon width={18} height={18} />
            {t("wallet.addToken.form.button.register.forMe")}
          </Button>
        ) : (
          <Button variant="primary">
            <DropletIcon width={18} height={18} />
            {t("wallet.addToken.form.button.register.hydra")}
          </Button>
        )}
      </div>
    </form>
  )
}
