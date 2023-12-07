import { memo } from "react"

import Jazzicon, { jsNumberForAddress } from "react-jazzicon"

export const MetaMaskAvatar = memo(
  (props: {
    address: string
    isAlternative?: boolean
    size: number
    className?: string
  }) => {
    return (
      <Jazzicon
        diameter={props.size}
        seed={jsNumberForAddress(props.address)}
      />
    )
  },
)
