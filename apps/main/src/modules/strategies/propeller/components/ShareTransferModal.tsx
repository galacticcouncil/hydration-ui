import {
  Alert,
  AssetInput,
  Box,
  Button,
  Chip,
  LoadingButton,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import {
  AddressBook,
  AddressBookModal,
  WalletMode,
} from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { type Hex, isAddress } from "viem"

import { AssetLogo } from "@/components/AssetLogo"
import { StrategyPosition } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"
import { JuicerStrategyLogo } from "@/modules/strategies/propeller/components/JuicerStrategyLogo"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/config/vaults"
import { useBaseRates } from "@/modules/strategies/propeller/hooks/useCollateralEquivalent"
import { vaultStatsQuery } from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useTransferShares } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

import { ShareTransferAssetPicker } from "./ShareTransferAssetPicker"

type Props = {
  positionId: string
  symbol: string
  assetId: string
  balance: string | null
  /** exact share balance backing the position; the MAX transfer sends this */
  shareBalance?: string | null
  isJuicer: boolean
  positions?: StrategyPosition[]
  open: boolean
  onClose: () => void
}

/** the recipient as an EVM address: 0x as-is, SS58 via its H160 twin */
const resolveRecipient = (destination: string): Hex | null => {
  if (isAddress(destination)) return destination
  const converted = safeConvertSS58toH160(destination)
  return converted && isAddress(converted) ? converted : null
}

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
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const [selectedAsset, setSelectedAsset] = useState(initialAsset)
  const { symbol, assetId, balance } = selectedAsset
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [destination, setDestination] = useState("")
  const [isMyContactsOpen, setIsMyContactsOpen] = useState(false)

  // Juicer: the modal's amounts are display-asset equivalents, but what moves
  // is vault shares — convert through the share and collateral spot rates.
  const vault = PROPELLER_VAULTS.find(
    (vault) => `juicer:${vault.vaultAddress}` === selectedAsset.positionId,
  )
  const decimals = vault
    ? getAssetWithFallback(vault.assetId).decimals
    : undefined
  const { data: stats } = useQuery({
    ...vaultStatsQuery(rpc, vault ?? PROPELLER_VAULTS[0]!, decimals ?? 18),
    enabled: rpc.isReady && isJuicer && !!vault,
  })
  const { getRate } = useBaseRates()
  const transfer = useTransferShares(vault ?? PROPELLER_VAULTS[0]!, {
    onSuccess: onClose,
  })

  const exchangeRate = stats?.exchangeRate ?? null
  const rate = vault ? getRate(vault) : null
  const shareBalance = selectedAsset.shareBalance ?? null
  // MAX in display units, floored so a typed max never exceeds the shares
  const maxDisplay =
    shareBalance !== null &&
    exchangeRate !== null &&
    rate !== null &&
    decimals !== undefined
      ? Big(shareBalance)
          .times(exchangeRate)
          .times(rate)
          .toFixed(decimals, Big.roundDown)
      : null

  const recipient = destination ? resolveRecipient(destination) : null
  const parsedAmount = (() => {
    try {
      return amount ? Big(amount) : null
    } catch {
      return null
    }
  })()
  const canConfirm =
    isJuicer &&
    !!vault &&
    maxDisplay !== null &&
    parsedAmount !== null &&
    parsedAmount.gt(0) &&
    parsedAmount.lte(maxDisplay) &&
    recipient !== null &&
    !transfer.isPending

  const onConfirm = () => {
    if (
      !canConfirm ||
      !vault ||
      !recipient ||
      shareBalance === null ||
      exchangeRate === null ||
      rate === null ||
      decimals === undefined
    )
      return
    // asking for everything shown sends the EXACT share balance; a partial
    // amount converts down and is clamped so rounding can never overdraw
    const isMax = Big(amount).gte(maxDisplay ?? "0")
    const sharesIn = Big(amount)
      .div(rate)
      .div(exchangeRate)
      .toFixed(decimals, Big.roundDown)
    transfer.mutate({
      shareAmount: isMax
        ? shareBalance
        : (Big(sharesIn).lt(shareBalance)
            ? Big(sharesIn)
            : Big(shareBalance)
          ).toFixed(decimals, Big.roundDown),
      displayAmount: amount,
      to: recipient,
    })
  }

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
            shareBalance: position.shareAmount,
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
                (maxDisplay ?? balance) === null
                  ? "—"
                  : `${isJuicer ? `${t("common:approx.short")} ` : ""}${t(
                      "common:number",
                      { value: maxDisplay ?? balance },
                    )}`,
              onMax:
                (maxDisplay ?? balance) === null
                  ? null
                  : () => setAmount((maxDisplay ?? balance) as string),
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
          description={
            isJuicer
              ? t("transfer.juicerDescription", { symbol })
              : `${t("transfer.previewOnly")} ${t("transfer.description")}`
          }
        />
        <Button
          variant="tertiary"
          size="large"
          display={[null, "none"]}
          onClick={onClose}
        >
          {t("common:cancel")}
        </Button>
        <LoadingButton
          size="large"
          isLoading={transfer.isPending}
          disabled={!canConfirm}
          onClick={onConfirm}
        >
          {t("common:confirm")}
        </LoadingButton>
      </ModalFooter>
    </>
  )
}
