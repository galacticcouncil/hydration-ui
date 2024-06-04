import { Button } from "components/Button/Button"
import { FC } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import {
  PARACHAIN_CONFIG,
  TExternalAsset,
  TExternalAssetInput,
  TRegisteredAsset,
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
import { ASSET_HUB_ID, PENDULUM_ID } from "api/externalAssetRegistry"
import { getPendulumInputData } from "utils/externalAssets"
import { omit } from "utils/rx"

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

  const mutation = useRegisterToken({
    onSuccess: (id: string) => {
      addToken({ ...omit(["location"], asset), internalId: id })
      refetchProvider()
    },
    assetName: asset.name,
  })

  const chainStored = assets.external.find(
    (chainAsset) =>
      chainAsset.externalId === asset.id &&
      chainAsset.parachainId === asset.origin.toString(),
  )

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

    const { parents, palletInstance } = PARACHAIN_CONFIG[ASSET_HUB_ID]

    let input: TExternalAssetInput | undefined = undefined

    if (asset.origin === ASSET_HUB_ID) {
      input = {
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
      }
    }

    if (asset.origin === PENDULUM_ID && asset.location) {
      input = getPendulumInputData(asset.location)
    }

    if (input) {
      await mutation.mutate(input)
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

        <Spacer size={0} />

        <TokenInfo asset={asset} isChainStored={!!chainStored} />

        <Spacer size={8} />

        {chainStored ? (
          <Button
            type="button"
            variant="primary"
            onClick={() =>
              onAddTokenToUser({
                ...omit(["location"], asset),
                internalId: chainStored.id,
              })
            }
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
