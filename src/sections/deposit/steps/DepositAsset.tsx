import { useCrossChainBalance } from "api/xcm"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import CopyIcon from "assets/icons/CopyIcon.svg?react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { Button, ButtonTransparent } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useCopy } from "hooks/useCopy"
import { useShallow } from "hooks/useShallow"
import { useRef } from "react"
import { useCustomCompareEffect } from "react-use"
import { CexDepositGuide } from "sections/deposit/components/CexDepositGuide"
import {
  CEX_DEPOSIT_CONFIG,
  useDeposit,
} from "sections/deposit/DepositPage.utils"
import { SAccountBox } from "sections/deposit/steps/DepositAsset.styled"
import { AssetConfig } from "sections/deposit/types"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { undefinedNoop } from "utils/helpers"
import { pick } from "utils/rx"

type DepositAssetProps = {
  onAsssetSelect: () => void
  onDepositSuccess: (asset: AssetConfig) => void
}

export const DepositAsset: React.FC<DepositAssetProps> = ({
  onAsssetSelect,
  onDepositSuccess,
}) => {
  const { account } = useAccount()
  const { asset, cexId } = useDeposit()

  const { copied, copy } = useCopy()

  const balanceSnapshot = useRef<bigint | null>(null)

  const { toggle: toggleWeb3Modal } = useWeb3ConnectStore(
    useShallow((state) => pick(state, ["toggle"])),
  )

  const activeCex = CEX_DEPOSIT_CONFIG.find((cex) => cex.id === cexId)
  const CexIcon = activeCex?.icon

  const address = account?.address ?? ""
  const srcChain = asset?.route[0] ?? ""

  const { data: balances } = useCrossChainBalance(address, srcChain)

  const assetBalance =
    balances?.find((a) => a.key === asset?.data.asset.key)?.amount ?? 0n

  function copyAndSnapshot() {
    if (!balances) return
    copy(address)
    balanceSnapshot.current = assetBalance
  }

  useCustomCompareEffect(
    () => {
      if (!asset) return
      if (!balanceSnapshot.current) return
      if (assetBalance > balanceSnapshot.current) {
        onDepositSuccess(asset)
      }
    },
    [assetBalance],
    (_, next) => {
      if (!balanceSnapshot.current) return false
      return next[0] > balanceSnapshot.current
    },
  )

  return (
    <div sx={{ flex: "column", gap: 20 }}>
      <button onClick={asset ? () => onDepositSuccess(asset) : undefined}>
        skip
      </button>
      <AssetSelect
        value="0"
        id={asset?.assetId ?? ""}
        name="deposit-asset"
        title={
          <span sx={{ flex: "row", align: "center", gap: 4, mb: 12 }}>
            <span>From</span>
            <span>{CexIcon && <Icon size={14} icon={<CexIcon />} />}</span>
            <span sx={{ color: "white" }}>{activeCex?.title}</span>
          </span>
        }
        onChange={undefinedNoop}
        onSelectAssetClick={onAsssetSelect}
        balance={null}
        balanceLabel=""
        withoutMaxValue
        withoutMaxBtn
        withoutValue
        css={{ pointerEvents: "none" }}
      />
      <CexDepositGuide />
      {account && (
        <SAccountBox>
          <ButtonTransparent
            sx={{ flex: "row", gap: 6, align: "center" }}
            onClick={() => toggleWeb3Modal()}
          >
            <AccountAvatar
              address={account.displayAddress || account.address}
              provider={account.provider}
              genesisHash={account?.genesisHash}
              size={20}
            />
            <Text fs={14}>{account.name}</Text>
            <Icon
              size={24}
              icon={<ChevronDown sx={{ color: "basic300", ml: -6 }} />}
            />
          </ButtonTransparent>
          <Text fs={14} color="brightBlue300">
            {account.address}
          </Text>
          <Button
            disabled={copied}
            size="micro"
            variant="primary"
            onClick={copyAndSnapshot}
          >
            <Icon size={14} icon={<CopyIcon />} />
            {copied ? "Awaiting" : "Copy Address"}
          </Button>
        </SAccountBox>
      )}
    </div>
  )
}
