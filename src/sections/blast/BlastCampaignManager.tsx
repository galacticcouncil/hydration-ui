import { useBlastCampaign } from "sections/blast/BlastCampaignManager.utils"
import { BlastCampaignModal } from "./BlastCampaignModal"
import { useBlastCampaignStore } from "sections/blast/store/useBlastCampaignStore"
import { useEffect, useState } from "react"
import { useMatchRoute, useNavigate } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import { HUSDC_ASSET_ID, TBTC_ASSET_ID, USDC_ASSET_ID } from "utils/constants"
import { ModalType } from "sections/lending/hooks/useModal"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export type BlastCampaignManagerProps = {}

export const BlastCampaignManager: React.FC<BlastCampaignManagerProps> = () => {
  const { account } = useAccount()
  const {
    hasWinningAsset,
    hasRewardAsset,
    winningAssetIds,
    rewardApy,
    isLoading,
  } = useBlastCampaign()

  const address = account?.address ?? ""

  const navigate = useNavigate()
  const matchRoute = useMatchRoute()

  const [modalOpen, setModalOpen] = useState(false)

  const { getSeenAssetIds, markAsSeen } = useBlastCampaignStore()

  const seenWinningAssetIds = account?.address
    ? getSeenAssetIds(account.address)
    : []

  const hasNewWinningAssets = winningAssetIds.some(
    (id) => !seenWinningAssetIds.includes(id),
  )

  useEffect(() => {
    if (!address || isLoading) return

    if (hasWinningAsset && hasRewardAsset && hasNewWinningAssets) {
      setModalOpen(true)
    }
  }, [hasWinningAsset, hasRewardAsset, hasNewWinningAssets, isLoading, address])

  const handleClose = () => {
    markAsSeen(address, winningAssetIds)
    setModalOpen(false)
  }

  const handleGetBitcoin = () => {
    markAsSeen(address, winningAssetIds)
    setModalOpen(false)

    if (matchRoute({ to: LINKS.swap })) {
      const url = new URL(window.location.href)
      url.searchParams.set("assetIn", USDC_ASSET_ID)
      url.searchParams.set("assetOut", TBTC_ASSET_ID)
      // reload with the new search params, because SwapApp doesnt react to search params changes
      window.location.assign(url)
    } else {
      navigate({
        to: LINKS.swap,
        search: { assetIn: USDC_ASSET_ID, assetOut: TBTC_ASSET_ID },
      })
    }
  }

  const handleEarnOnUSDC = () => {
    markAsSeen(address, winningAssetIds)
    setModalOpen(false)
    navigate({
      to: LINKS.borrowDashboard,
      search: {
        modalType: ModalType.GigaSupply,
        assetId: HUSDC_ASSET_ID,
      },
    })
  }

  return (
    <BlastCampaignModal
      open={modalOpen}
      rewardApy={rewardApy}
      onClose={handleClose}
      onGetBitcoin={handleGetBitcoin}
      onEarnOnUSDC={handleEarnOnUSDC}
    />
  )
}
