import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { AddressInput } from "components/AddressInput/AddressInput"
import { Maybe } from "utils/helpers"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { ReactComponent as GuestIcon } from "assets/icons/GuestIcon.svg"
import { SIconContainer } from "./WalletTransferAccountInput.styled"

interface Props {
  name: string
  value: Maybe<string>
  onChange?: (value: string) => void
  onBlur?: () => void
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
      <SIconContainer>
        {validAddress ? (
          <AccountAvatar address={validAddress} size={36} theme="basilisk" />
        ) : (
          <GuestIcon width={36} height={36} />
        )}
      </SIconContainer>

      <AddressInput
        disabled={!props.onChange}
        name={props.name}
        label={props.name}
        onChange={props.onChange}
        onBlur={props.onBlur}
        value={props.value}
        error={props.error}
      />
    </div>
  )
}
