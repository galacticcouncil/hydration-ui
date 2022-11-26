import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { AddressInput } from "components/AddressInput/AddressInput"
import { Maybe } from "utils/helpers"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { ReactComponent as GuestIcon } from "assets/icons/GuestIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { SContainer, SIconContainer } from "./WalletTransferAccountInput.styled"
import { ReactNode } from "react"
import { SErrorMessage } from "components/AddressInput/AddressInput.styled"

interface Props {
  name: string
  value: Maybe<string>
  onChange?: (value: string) => void
  onBlur?: () => void
  error?: string
  label?: string
  placeholder?: string
  rightIcon?: ReactNode
}

export const WalletTransferAccountInput = (props: Props) => {
  let validAddress: string | null = null
  const isDisabled = !props.onChange
  try {
    validAddress = encodeAddress(decodeAddress(props.value))
  } catch {}

  return (
    <>
      <SContainer disabled={isDisabled} id={props.name} error={!!props.error}>
        <Text fs={12} color="basic500" tTransform={"uppercase"} sx={{ mb: 8 }}>
          {props.label}
        </Text>
        <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
          {validAddress ? (
            <AccountAvatar
              address={validAddress}
              size={35}
              theme="hydra"
              css={{ padding: 5 }}
            />
          ) : (
            <SIconContainer>
              <GuestIcon width={35} height={35} />
            </SIconContainer>
          )}

          <AddressInput
            disabled={isDisabled}
            name={props.name}
            label={props.name}
            onBlur={props.onBlur}
            onChange={props.onChange}
            value={props.value}
            error={props.error}
            placeholder={props.placeholder}
            rightIcon={props.rightIcon}
          />
        </div>
      </SContainer>
      {props.error && <SErrorMessage>{props.error}</SErrorMessage>}
    </>
  )
}
