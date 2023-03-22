import { useCallback, useState } from "react"
import { AssetsModal } from "./AssetsModal"
import { u32 } from "@polkadot/types"
import { Maybe } from "utils/helpers"

interface useAssetsModalProps {
  onSelect?: (id: u32 | string) => void
  allowedAssets?: Maybe<u32 | string>[]
}

export const useAssetsModal = ({
  onSelect,
  allowedAssets,
}: useAssetsModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleSelect = useCallback(
    (id: u32 | string) => {
      setIsOpen(false)
      onSelect?.(id)
    },
    [onSelect],
  )

  const modal = isOpen ? (
    <AssetsModal
      onClose={() => setIsOpen(false)}
      onSelect={handleSelect}
      allowedAssets={allowedAssets}
    />
  ) : null

  return {
    openModal,
    modal,
    isOpen,
  }
}
