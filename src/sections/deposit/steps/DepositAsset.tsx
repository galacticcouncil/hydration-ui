import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { useCrossChainBalance } from "api/xcm"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import CopyIcon from "assets/icons/CopyIcon.svg?react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { AssetSelectButton } from "components/AssetSelect/AssetSelectButton"
import { Button, ButtonTransparent } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Spinner } from "components/Spinner/Spinner"
import { Text } from "components/Typography/Text/Text"
import { useCopy } from "hooks/useCopy"
import { useShallow } from "hooks/useShallow"
import { useRef } from "react"
import { useCustomCompareEffect } from "react-use"
import { CexDepositGuide } from "sections/deposit/components/CexDepositGuide"
import {
  CEX_DEPOSIT_CONFIG,
  createCexWithdrawalUrl,
  useDeposit,
} from "sections/deposit/DepositPage.utils"
import {
  SAccountBox,
  SAssetSelectButtonBox,
} from "sections/deposit/steps/DepositAsset.styled"
import { AssetConfig } from "sections/deposit/types"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import { isEvmAccount } from "utils/evm"
import { safeConvertAddressSS58 } from "utils/formatting"
import { isAnyParachain } from "utils/helpers"
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
  const { isLoading, asset, cexId, setIsLoading, setDepositedAmount } =
    useDeposit()

  const { copy } = useCopy()

  const balanceSnapshot = useRef<bigint | null>(null)

  const { toggle: toggleWeb3Modal } = useWeb3ConnectStore(
    useShallow((state) => pick(state, ["toggle"])),
  )

  const activeCex = CEX_DEPOSIT_CONFIG.find((cex) => cex.id === cexId)
  const CexIcon = activeCex?.icon

  const address = account?.address ?? ""
  const dstChain = asset?.route[0] ?? ""

  const { data: balances } = useCrossChainBalance(address, dstChain)

  const assetBalance =
    balances?.find((a) => a.key === asset?.data.asset.key)?.amount ?? 0n

  function copyAndSnapshot() {
    if (!balances) return
    if (!asset) return
    copy(address)
    setIsLoading(true)
    window.open(createCexWithdrawalUrl(cexId, asset.data), "_blank")
    balanceSnapshot.current = assetBalance
  }

  useCustomCompareEffect(
    () => {
      if (!asset) return
      if (!balanceSnapshot.current) return
      if (assetBalance > balanceSnapshot.current) {
        const depositedAmount = assetBalance - balanceSnapshot.current
        onDepositSuccess(asset)
        setDepositedAmount(depositedAmount)
      }
    },
    [assetBalance],
    (_, next) => {
      if (!balanceSnapshot.current) return false
      return next[0] > balanceSnapshot.current
    },
  )

  const chain = chainsMap.get(dstChain)
  const formattedAddress =
    chain && isAnyParachain(chain)
      ? safeConvertAddressSS58(address, chain.ss58Format, false)
      : null

  const isAccountAllowed = isEvmAccount(address)
    ? chain?.isEvmParachain() ?? false
    : true

  return (
    <div sx={{ flex: "column", gap: 20 }}>
      <SAssetSelectButtonBox css={isLoading && { pointerEvents: "none" }}>
        <Text
          sx={{ flex: "row", align: "center", gap: 4 }}
          fs={11}
          lh={22}
          tTransform="uppercase"
          color="whiteish500"
        >
          <span>From</span>
          <span>{CexIcon && <Icon size={14} icon={<CexIcon />} />}</span>
          <span sx={{ color: "white" }}>{activeCex?.title}</span>
        </Text>
        <AssetSelectButton
          onClick={isLoading ? undefined : onAsssetSelect}
          assetId={asset?.assetId ?? ""}
        />
      </SAssetSelectButtonBox>
      <CexDepositGuide />
      {!account && <Web3ConnectModalButton />}
      {account && (
        <SAccountBox>
          <ButtonTransparent
            disabled={isLoading}
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
              icon={
                <ChevronDown
                  sx={{
                    color: "basic300",
                    ml: -6,
                    opacity: isLoading ? 0.5 : 1,
                  }}
                />
              }
            />
          </ButtonTransparent>
          {isAccountAllowed ? (
            <Text fs={14} color="brightBlue300">
              {formattedAddress}
            </Text>
          ) : (
            <Text fs={14} color="red400">
              EVM Account not allowed for depositing{" "}
              {asset?.data.asset.originSymbol}
            </Text>
          )}
          <Button
            size="micro"
            variant="primary"
            disabled={!isAccountAllowed}
            onClick={copyAndSnapshot}
            css={
              isLoading
                ? {
                    background: `rgba(${theme.rgbColors.pink700}, 0.5)`,
                    pointerEvents: "none",
                  }
                : undefined
            }
          >
            {isLoading ? (
              <Spinner size={14} />
            ) : (
              <Icon size={14} icon={<CopyIcon />} />
            )}

            {isLoading ? "Awaiting deposit" : "Copy Address"}
          </Button>
        </SAccountBox>
      )}
    </div>
  )
}
