import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { AddressInput } from "components/AddressInput/AddressInput"
import { Maybe } from "utils/helpers"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { ReactComponent as GuestIcon } from "assets/icons/GuestIcon.svg"

interface Props {
  name: string
  value: Maybe<string>
  onChange?: (value: string) => void
  error?: string
}

export const WalletTransferAccountInput = (props: Props) => {
  let validAddress: string | null = null
  try {
    validAddress = encodeAddress(decodeAddress(props.value))
  } catch {}

  return (
    <div
      css={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        sx={{ bg: "black", flex: "column", align: "center", p: 8 }}
        css={{ borderRadius: 9999 }}
      >
        {validAddress ? (
          <AccountAvatar address={validAddress} size={42} theme="basilisk" />
        ) : (
          <GuestIcon />
        )}
      </div>

      <AddressInput
        disabled={!props.onChange}
        name={props.name}
        label={props.name}
        onChange={props.onChange}
        value={props.value}
        error={props.error}
      />
    </div>
  )
}
