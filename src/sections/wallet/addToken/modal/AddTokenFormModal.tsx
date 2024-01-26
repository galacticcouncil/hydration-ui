import { Button } from "components/Button/Button"
import { FC } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  PARACHAIN_CONFIG,
  TExternalAsset,
} from "sections/wallet/addToken/AddToken.utils"
import { SInput } from "./AddTokenFormModal.styled"
import { FormValues } from "utils/helpers"

import DropletIcon from "assets/icons/DropletIcon.svg?react"
import PixelUserIcon from "assets/icons/PixelUserIcon.svg?react"

type Props = {
  asset?: TExternalAsset
}

type FormFields = {
  multilocation: object
  name: string
  decimals: string
  symbol: string
}

export const AddTokenFormModal: FC<Props> = ({ asset }) => {
  const { t } = useTranslation()

  const form = useForm<FormFields>({
    mode: "onSubmit",
    defaultValues: {
      name: asset?.name ?? "",
      symbol: asset?.symbol ?? "",
      decimals: asset?.decimals?.toString() ?? "",
      multilocation: asset?.parachainId
        ? PARACHAIN_CONFIG[asset.parachainId.toString()]
        : {},
    },
  })
  console.log(form.getValues("multilocation"))
  const onSubmit = async (values: FormValues<typeof form>) => {
    console.log(values)
  }

  const hasAsset = !!asset

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
        <div
          sx={{
            flex: ["column", "row"],
            justify: hasAsset ? "space-between" : "center",
            mt: ["auto", 30],
            gap: 8,
          }}
        >
          <Button variant="secondary">
            <DropletIcon width={18} height={18} />
            {t("wallet.addToken.form.button.register.hydra")}
          </Button>
          {hasAsset && (
            <Button variant="primary">
              <PixelUserIcon width={18} height={18} />
              {t("wallet.addToken.form.button.register.forMe")}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
