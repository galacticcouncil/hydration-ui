import * as React from "react"
import { AssetId } from "@galacticcouncil/ui"
import { Button } from "components/Button/Button"
import { FC } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import {
  TExternalAsset,
  TRegisteredAsset,
  getInputData,
  useRegisterToken,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { HydradxRuntimeXcmAssetLocation } from "@polkadot/types/lookup"
import DropletIcon from "assets/icons/DropletIcon.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { useRpcProvider } from "providers/rpcProvider"
import { Spacer } from "components/Spacer/Spacer"
import { useToast } from "state/toasts"
import { useRefetchProviderData } from "api/provider"
import { InputBox } from "components/Input/InputBox"
import { TokenInfo } from "./components/TokenInfo/TokenInfo"
import { omit } from "utils/rx"
import { createComponent } from "@lit-labs/react"
import { Separator } from "components/Separator/Separator"
import { TokenInfoHeader } from "./components/TokenInfo/TokenInfoHeader"
import { useExternalTokensRugCheck } from "api/externalAssetRegistry"

export const UigcAssetId = createComponent({
  tagName: "uigc-asset-id",
  elementClass: AssetId,
  react: React,
})

type Props = {
  asset: TExternalAsset & { location?: HydradxRuntimeXcmAssetLocation }
  onClose: () => void
}

type FormFields = {
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

  const chainStored = assets.external.find(
    (chainAsset) =>
      chainAsset.externalId === asset.id &&
      chainAsset.parachainId === asset.origin.toString(),
  )

  const rugCheck = useExternalTokensRugCheck()
  const rugCheckData = rugCheck.tokensMap.get(chainStored?.id ?? "")

  const mutation = useRegisterToken({
    onSuccess: (id: string) => {
      addToken({ ...omit(["location"], asset), internalId: id })
      refetchProvider()
    },
    assetName: asset.name,
  })

  const form = useForm<FormFields>({
    mode: "onSubmit",
    defaultValues: {
      name: asset.name,
      symbol: asset.symbol,
      decimals: asset.decimals.toString(),
    },
  })

  const onSubmit = async () => {
    if (!asset) throw new Error("Selected asset cannot be added")
    const input = getInputData(asset)
    if (input) {
      await mutation.mutateAsync(input)
    }
    onClose()
  }

  const hasAsset = !!asset

  const onAddTokenToUser = async (asset: TRegisteredAsset) => {
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
    <>
      <TokenInfoHeader asset={asset} internalId={chainStored?.id} />
      <Separator sx={{ my: 10 }} color="darkBlue401" />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
        sx={{ height: "100%" }}
      >
        <div sx={{ flex: "column", gap: 8, height: "100%" }}>
          <div hidden>
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
          </div>

          <Spacer size={0} />

          <TokenInfo externalAsset={asset} chainStoredAsset={chainStored} />

          <Spacer size={8} />

          {chainStored ? (
            <Button
              type="button"
              variant="primary"
              sx={{ mt: "auto" }}
              onClick={() => {
                const token = {
                  ...omit(["location"], asset),
                  internalId: chainStored.id,
                }
                console.log({ token })
                onAddTokenToUser({
                  ...omit(["location"], asset),
                  internalId: chainStored.id,
                })
              }}
            >
              {rugCheckData?.warnings.length ? (
                t("wallet.addToken.form.button.register.update")
              ) : (
                <>
                  <PlusIcon width={18} height={18} />
                  {t("wallet.addToken.form.button.register.forMe")}
                </>
              )}
            </Button>
          ) : (
            <Button variant="primary" sx={{ mt: "auto" }}>
              <DropletIcon width={18} height={18} />
              {t("wallet.addToken.form.button.register.hydra")}
            </Button>
          )}
        </div>
      </form>
    </>
  )
}
