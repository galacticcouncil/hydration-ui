import { useExternalAssetRegistry } from "api/externalAssetRegistry"
import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import {
  TExternalAsset,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { isNotNil } from "utils/helpers"
import { Text } from "components/Typography/Text/Text"
import { Icon } from "components/Icon/Icon"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Button, ButtonTransparent } from "components/Button/Button"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { useToast } from "state/toasts"

type Props = {
  assetIds: string[]
  onAssetsAdded?: (assets: TExternalAsset[]) => void
}

export const ExternalAssetImportModal: React.FC<Props> = ({
  assetIds = [],
  onAssetsAdded,
}) => {
  const { t } = useTranslation()
  const { add } = useToast()
  const [isOpen, setIsOpen] = useState(true)
  const { assets } = useRpcProvider()
  const { isAdded, addToken } = useUserExternalTokenStore()

  const { data, isSuccess } = useExternalAssetRegistry()

  const assetsMeta = assets.getAssets(assetIds)

  const assetsToAdd = useMemo(() => {
    return assetsMeta
      .filter(({ id, generalIndex }) => {
        const isChainStored = assets.external.some((asset) => asset.id === id)
        const isUserStored = isAdded(generalIndex)
        return isChainStored && !isUserStored
      })
      .map(({ parachainId, generalIndex }) => {
        if (!parachainId) return null
        const assets = data?.[+parachainId] ?? []
        return assets.find(({ id }) => id === generalIndex)
      })
      .filter(isNotNil)
  }, [assets.external, assetsMeta, data, isAdded])

  if (assetsToAdd.length === 0 || !isSuccess) {
    return null
  }

  const addAssets = async (assets: TExternalAsset[]) => {
    assets.forEach((asset) => {
      addToken(asset)
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
    })

    onAssetsAdded?.(assets)
  }

  return (
    <Modal
      open={isOpen}
      disableCloseOutside={true}
      onClose={() => setIsOpen(false)}
    >
      <ModalContents
        contents={[
          {
            title: t("wallet.assets.table.addToken"),
            description:
              "Add folllowing asset(s) to your UI in order to trade.",
            content: (
              <div>
                <div sx={{ mb: 20, flex: "column", gap: 10 }}>
                  {assetsToAdd.map(({ name, origin, id }) => (
                    <div key={`${origin}-${id}`}>
                      <Text
                        fs={18}
                        sx={{ flex: "row", align: "center", gap: 10 }}
                      >
                        <Icon icon={<AssetLogo />} size={32} />
                        {name}
                      </Text>
                    </div>
                  ))}
                </div>
                <div sx={{ mt: "auto" }}>
                  <Button
                    fullWidth
                    variant="primary"
                    onClick={() => addAssets(assetsToAdd)}
                  >
                    <PlusIcon width={18} height={18} />
                    {t("wallet.addToken.form.button.register.forMe")}
                  </Button>
                  <ButtonTransparent
                    onClick={() => setIsOpen(false)}
                    sx={{ color: "basic300", pt: 10, mx: "auto" }}
                  >
                    {t("cancel")}
                  </ButtonTransparent>
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  )
}
