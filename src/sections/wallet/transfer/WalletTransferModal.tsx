import { u32 } from "@polkadot/types"
import { Modal } from "components/Modal/Modal"
import { PillSwitch } from "components/PillSwitch/PillSwitch"
import { useState } from "react"

import { useTranslation } from "react-i18next"

import { WalletTransferSectionOnchain } from "sections/wallet/transfer/onchain/WalletTransferSectionOnchain"
import { WalletTransferSectionCrosschain } from "sections/wallet/transfer/crosschain/WalletTransferSectionCrosschain"

export function WalletTransferModal(props: {
  open: boolean
  onClose: () => void
  initialAsset: u32 | string
}) {
  const { t } = useTranslation()
  const [chain, setChain] = useState<"onchain" | "crosschain">("onchain")

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      topContent={
        <div sx={{ flex: "column", align: "center", mb: 16 }}>
          <PillSwitch
            options={[
              {
                value: "onchain" as const,
                label: t("wallet.assets.transfer.switch.onchain"),
              },
              {
                value: "crosschain" as const,
                label: t("wallet.assets.transfer.switch.crosschain"),
              },
            ]}
            value={chain}
            onChange={setChain}
          />
        </div>
      }
    >
      {chain === "onchain" && (
        <WalletTransferSectionOnchain
          initialAsset={props.initialAsset}
          onClose={props.onClose}
        />
      )}

      {chain === "crosschain" && (
        <WalletTransferSectionCrosschain onClose={props.onClose} />
      )}
    </Modal>
  )
}
