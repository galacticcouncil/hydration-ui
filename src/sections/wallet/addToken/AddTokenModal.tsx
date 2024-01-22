import { useExternalAssetRegistry } from "api/externalAssetRegistry"
import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Text } from "components/Typography/Text/Text"

export const AddTokenModal = ({ onClose }: { onClose: () => void }) => {
  const assetRegistry = useExternalAssetRegistry()
  const assets = assetRegistry.data?.["1000"]

  return (
    <Modal open disableCloseOutside onClose={onClose}>
      <ModalContents
        disableAnimation
        onClose={onClose}
        contents={[
          {
            title: "Add Token",
            content: (
              <div sx={{ flex: "column", gap: 12 }}>
                {assets?.map((asset) => (
                  <Text>
                    {asset.symbol} {asset.name}
                  </Text>
                ))}
              </div>
            ),
          },
        ]}
      />
    </Modal>
  )
}
