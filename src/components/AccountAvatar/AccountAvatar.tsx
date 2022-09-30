import Identicon from "@polkadot/react-identicon"
import { TalismanAvatar } from "components/AccountAvatar/TalismanAvatar"
import { IconTheme } from "@polkadot/react-identicon/types"

export function AccountAvatar(props: {
  address: string
  size: number
  theme: string
  className?: string
}) {
  if (props.theme === "talisman") {
    return (
      <TalismanAvatar
        seed={props.address}
        width={props.size}
        height={props.size}
        className={props.className}
      />
    )
  }

  let identiconTheme: IconTheme = "substrate"
  if (props.theme === "polkadot-js") identiconTheme = "polkadot"
  return (
    <Identicon
      theme={identiconTheme}
      size={props.size}
      value={props.address}
      className={props.className}
    />
  )
}
