import { WalletTransferCrosschainList } from "./WalletTransferCrosschainList"
import { WalletTransferSectionCrosschainGuide } from "./WalletTransferSectionCrosschainGuide"
import { CROSSCHAINS } from "./WalletTransferSectionCrosschain.utils"

type Props = {
  onClose: () => void
  active?: typeof CROSSCHAINS[number]
  setActive: (chain: typeof CROSSCHAINS[number] | undefined) => void
}
export function WalletTransferSectionCrosschain({
  onClose,
  active,
  setActive,
}: Props) {
  return (
    <>
      {active ? (
        <WalletTransferSectionCrosschainGuide
          name={active.name}
          icon={active.icon}
          onBack={() => setActive(undefined)}
          onVisit={() => window.open(active.url, "_blank")}
        >
          {active.guide}
        </WalletTransferSectionCrosschainGuide>
      ) : (
        <WalletTransferCrosschainList
          onClose={onClose}
          onSelect={(name) => {
            const active = CROSSCHAINS.find((i) => i.name === name)
            if (active != null) {
              if (active.guide == null) {
                window.open(active.url, "_blank")
              } else {
                setActive(active)
              }
            }
          }}
        />
      )}
    </>
  )
}
