import { u32 } from "@polkadot/types"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { PillSwitch } from "components/PillSwitch/PillSwitch"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { WalletTransferSectionCrosschain } from "sections/wallet/transfer/crosschain/WalletTransferSectionCrosschain"
import { WalletTransferSectionOnchain } from "sections/wallet/transfer/onchain/WalletTransferSectionOnchain"
import { theme } from "theme"
import { CROSSCHAINS } from "./crosschain/WalletTransferSectionCrosschain.utils"

export function WalletTransferModal(props: {
  open: boolean
  onClose: () => void
  initialAsset: u32 | string
}) {
  const { t } = useTranslation()
  const [active, setActive] = useState<
    (typeof CROSSCHAINS)[number] | undefined
  >()
  const [asset, setAsset] = useState(props.initialAsset)

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { page, direction, paginateTo } = useModalPagination()

  const openAssets = () => paginateTo(2)
  const openOnChain = () => paginateTo(0)

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      disableClose={!isDesktop}
      topContent={
        <PillSwitch
          options={[
            {
              value: 0,
              label: t("wallet.assets.transfer.switch.onchain"),
            },
            {
              value: 1,
              label: t("wallet.assets.transfer.switch.bridge"),
            },
          ]}
          value={page === 2 || page === 0 ? 0 : 1}
          onChange={paginateTo}
        />
      }
    >
      <ModalContents
        page={page}
        direction={direction}
        onClose={props.onClose}
        onBack={openOnChain}
        contents={[
          {
            title: t("wallet.assets.transfer.title"),
            content: (
              <WalletTransferSectionOnchain
                asset={asset}
                openAssets={openAssets}
                onClose={props.onClose}
              />
            ),
          },
          {
            title: active
              ? undefined
              : t("wallet.assets.transfer.bridge.title"),
            hideBack: true,
            content: (
              <WalletTransferSectionCrosschain
                onClose={props.onClose}
                active={active}
                setActive={setActive}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "FontOver",
            noPadding: true,
            content: (
              <AssetsModalContent
                onSelect={(a) => {
                  setAsset(a.id)
                  openOnChain()
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
