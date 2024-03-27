import { Button } from "components/Button/Button"
import { FC } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import {
  PARACHAIN_CONFIG,
  TExternalAsset,
  useRegisterToken,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { FormValues } from "utils/helpers"

import DropletIcon from "assets/icons/DropletIcon.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { useRpcProvider } from "providers/rpcProvider"
import { Spacer } from "components/Spacer/Spacer"
import { useToast } from "state/toasts"
import { useRefetchProviderData } from "api/provider"
import { InputBox } from "components/Input/InputBox"

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
  const { addToken } = useUserExternalTokenStore()
  const refetchProvider = useRefetchProviderData()
  const { add } = useToast()

  const mutation = useRegisterToken({
    onSuccess: () => {
      addToken(asset)
      console.log("before refetch")
      refetchProvider()
      console.log("after refetch")
    },
    assetName: asset.name,
  })

  const isChainStored = assets.external.some(
    (chainAsset) => chainAsset.generalIndex === asset.id,
  )

  const form = useForm<FormFields>({
    mode: "onSubmit",
    defaultValues: {
      name: asset.name,
      symbol: asset.symbol,
      decimals: asset.decimals.toString(),
      multilocation: asset.origin ? PARACHAIN_CONFIG[asset.origin] : {},
    },
  })

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (!asset) throw new Error("Selected asset cannot be added")

    const { parents, palletInstance } = values.multilocation

    await mutation.mutate({
      parents,
      interior: {
        X3: [
          {
            Parachain: asset.origin.toString(),
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

    onClose()
  }

  const hasAsset = !!asset

  const onAddTokenToUser = async (asset: TExternalAsset) => {
    addToken(asset)
    refetchProvider()
    add("success", {
      title: (
        <Trans
          t={t}
          i18nKey="wallet.addToken.toast.add.onSuccess"
          tOptions={{
            name: asset.name,
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      ),
    })
    onClose()
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      autoComplete="off"
      sx={{ height: "100%" }}
    >
      <div sx={{ flex: "column", gap: 8, height: "100%" }}>
        <Controller
          name="name"
          control={form.control}
          render={({ field }) => (
            <InputBox
              placeholder={t("wallet.addToken.form.name")}
              {...field}
              disabled={hasAsset}
              label={t("wallet.addToken.form.name")}
              withLabel
            />
          )}
        />
        <Controller
          name="symbol"
          control={form.control}
          render={({ field }) => (
            <InputBox
              placeholder={t("wallet.addToken.form.symbol")}
              {...field}
              disabled={hasAsset}
              label={t("wallet.addToken.form.symbol")}
              withLabel
            />
          )}
        />
        <Controller
          name="decimals"
          control={form.control}
          render={({ field }) => (
            <InputBox
              placeholder={t("wallet.addToken.form.decimals")}
              {...field}
              disabled={hasAsset}
              label={t("wallet.addToken.form.decimals")}
              withLabel
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
