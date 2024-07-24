import { HydradxRuntimeXcmAssetLocation } from "@polkadot/types/lookup"
import { useRefetchProviderData } from "api/provider"
import { Trans, useTranslation } from "react-i18next"
import {
  TExternalAsset,
  TRegisteredAsset,
  useRegisterToken,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { useToast } from "state/toasts"
import { omit } from "utils/rx"

export const useAddTokenFormModalActions = (
  asset: TExternalAsset & { location?: HydradxRuntimeXcmAssetLocation },
) => {
  const { t } = useTranslation()
  const { addToken, addTokenConsent, isAdded } = useUserExternalTokenStore()
  const refetchProvider = useRefetchProviderData()
  const { add } = useToast()
  const mutation = useRegisterToken({
    onSuccess: (id: string) => {
      addToken({ ...omit(["location"], asset), internalId: id })
      refetchProvider()
    },
  })

  const registerToken = async () => {
    if (!asset) throw new Error("Selected asset cannot be added")
    await mutation.mutateAsync(asset)
  }

  const addTokenToUser = async (asset: TRegisteredAsset) => {
    const isTokenAdded = isAdded(asset.id)

    addToken(asset)
    refetchProvider()

    if (!isTokenAdded) {
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
    }
  }

  return {
    registerToken,
    addTokenToUser,
    addTokenConsent,
  }
}
