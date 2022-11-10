import { useState } from "react"

import { WalletTransferCrosschainList } from "./WalletTransferCrosschainList"
import { WalletTransferSectionCrosschainGuide } from "./WalletTransferSectionCrosschainGuide"
import { CROSSCHAINS } from "./WalletTransferSectionCrosschain.utils"

export function WalletTransferSectionCrosschain(props: {
  onClose: () => void
}) {
  const [active, setActive] = useState<typeof CROSSCHAINS[number] | undefined>()

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
          onClose={props.onClose}
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
