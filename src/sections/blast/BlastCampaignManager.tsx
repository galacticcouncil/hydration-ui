import { useMatchRoute, useNavigate, useSearch } from "@tanstack/react-location"
import { Modal } from "components/Modal/Modal"
import { useEffect, useState } from "react"
import { useBlastCampaign } from "sections/blast/BlastCampaignManager.utils"
import { useBlastCampaignStore } from "sections/blast/store/useBlastCampaignStore"
import { ModalType } from "sections/lending/hooks/useModal"
import {
  useAccount,
  useForceEnableNovaWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { HUSDC_ASSET_ID, TBTC_ASSET_ID, USDC_ASSET_ID } from "utils/constants"
import { LINKS } from "utils/navigation"
import { BlastCampaignModalContent } from "./BlastCampaignModalContent"

const CAMPAIGN_PARAM_NAME = "usdcblast"

export const BlastCampaignManager = () => {
  const { account } = useAccount()
  const {
    hasWinningAsset,
    hasRewardAsset,
    winningAssetIds,
    rewardApy,
    isLoading,
  } = useBlastCampaign()

  const search = useSearch<{
    readonly Search: { campaign?: string }
  }>()

  useForceEnableNovaWallet(search.campaign === CAMPAIGN_PARAM_NAME)

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
    <Modal open={modalOpen} onClose={handleClose} headerVariant="simple">
      <BlastCampaignModalContent
        rewardApy={rewardApy}
        onGetBitcoin={handleGetBitcoin}
        onEarnOnUSDC={handleEarnOnUSDC}
      />
    </Modal>
  )
}
