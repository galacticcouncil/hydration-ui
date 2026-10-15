import {
  Alert,
  AssetInput,
  Box,
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import {
  AddressBook,
  AddressBookModal,
  WalletMode,
} from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { StrategyPosition } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"
import { JuicerStrategyLogo } from "@/modules/strategies/propeller/components/JuicerStrategyLogo"

import { ShareTransferAssetPicker } from "./ShareTransferAssetPicker"

type Props = {
  positionId: string
  symbol: string
  assetId: string
  balance: string | null
  isJuicer: boolean
  positions?: StrategyPosition[]
  open: boolean
  onClose: () => void
}

// TODO: Connect share-specific transfers before enabling Confirm. For Juicer,
// assetId identifies the collateral logo, not the vault share token. Juicer
// inputs use underlying-asset equivalents; convert these to the correct vault's
// shares at confirmation, and use the exact share balance for Max transfers.
export const ShareTransferModal = ({ open, onClose, ...props }: Props) => (
  <Modal
    variant="popup"
    open={open}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose()
    }}
    disableInteractOutside
  >
    {open && (
      <ShareTransferModalContent
        key={props.positionId}
        {...props}
        onClose={onClose}
      />
    )}
  </Modal>
)

const ShareTransferModalContent = ({
  isJuicer,
  positions = [],
  onClose,
  ...initialAsset
}: Omit<Props, "open">) => {
  const { t } = useTranslation(["propeller", "common", "wallet"])
  const [selectedAsset, setSelectedAsset] = useState(initialAsset)
  const { symbol, assetId, balance } = selectedAsset
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [destination, setDestination] = useState("")
  const [isMyContactsOpen, setIsMyContactsOpen] = useState(false)

  if (isJuicer && isAssetPickerOpen) {
    return (
      <ShareTransferAssetPicker
        assets={positions
          .filter(
            (position) =>
              position.strategy === "juicer" && position.hasPosition,
          )
          .map((position) => ({
            positionId: position.id,
            assetId: position.assetId,
            symbol: position.symbol,
            balance: position.underlyingAmount,
          }))}
        selected={selectedAsset}
        onSelect={(asset) => {
          setSelectedAsset(asset)
          setAmount("")
          setIsAssetPickerOpen(false)
        }}
        onBack={() => setIsAssetPickerOpen(false)}
      />
    )
  }

  if (isMyContactsOpen) {
    return (
      <AddressBookModal
        whitelist={[WalletMode.Substrate, WalletMode.EVM]}
        onBack={() => setIsMyContactsOpen(false)}
        onSelect={(address) => {
          setDestination(address.address)
          setIsMyContactsOpen(false)
        }}
      />
    )
  }

  return (
    <>
      <ModalHeader align="center" title={t("wallet:transfer.modal.title")} />
      <ModalBody sx={{ py: 0 }}>
        <ModalContentDivider />
        <Box py="l" width="100%">
          <AssetInput
            label={t("wallet:transfer.modal.asset.label")}
            asset={{
              symbol,
              icon: <AssetLogo id={assetId} />,
              badge: isJuicer ? (
                <Chip
                  variant="amber"
                  size="extra-small"
                  rounded
                  sx={{ gap: "xs" }}
                >
                  <JuicerStrategyLogo
                    size="extra-small"
                    withBackground={false}
                  />
                  Juicer
                </Chip>
              ) : undefined,
            }}
            onAssetClick={
              isJuicer ? () => setIsAssetPickerOpen(true) : undefined
            }
            value={amount}
            onChange={setAmount}
            isDisabled={balance === null}
            balance={{
              label: t("common:balance"),
              value:
                balance === null
                  ? "—"
                  : `${isJuicer ? `${t("common:approx.short")} ` : ""}${t(
                      "common:number",
                      { value: balance },
                    )}`,
              onMax: balance === null ? null : () => setAmount(balance),
            }}
          />
        </Box>
        <ModalContentDivider />
        <AddressBook
          address={destination}
          onAddressChange={setDestination}
          onOpenMyContacts={() => setIsMyContactsOpen(true)}
        />
        <ModalContentDivider />
      </ModalBody>
      <ModalFooter
        display="grid"
        sx={{
          justifyContent: "space-between",
          flexDirection: "row",
          gridTemplateColumns: "1fr",
          gap: "xl",
        }}
      >
        <Alert
          variant="info"
          description={`${t("transfer.previewOnly")} ${
            isJuicer
              ? t("transfer.juicerDescription", { symbol })
              : t("transfer.description")
          }`}
        />
        <Button
          variant="tertiary"
          size="large"
          display={[null, "none"]}
          onClick={onClose}
        >
          {t("common:cancel")}
        </Button>
        <Button size="large" disabled>
          {t("common:confirm")}
        </Button>
      </ModalFooter>
    </>
  )
}
