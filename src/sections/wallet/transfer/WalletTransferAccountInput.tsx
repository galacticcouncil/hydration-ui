import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { ReactComponent as GuestIcon } from "assets/icons/GuestIcon.svg"
import { ReactComponent as IconWalletSmall } from "assets/icons/IconWalletSmall.svg"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { AddressInput } from "components/AddressInput/AddressInput"
import { SErrorMessage } from "components/AddressInput/AddressInput.styled"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Maybe } from "utils/helpers"
import {
  SAddressBookButton,
  SContainer,
  SIconContainer,
} from "./WalletTransferAccountInput.styled"

interface Props {
  name: string
  value: Maybe<string>
  onChange?: (value: string) => void
  onBlur?: () => void
  error?: string
  label?: string
  placeholder?: string
  rightIcon?: ReactNode
  openAddressBook?: () => void
}

export const WalletTransferAccountInput = (props: Props) => {
  const { t } = useTranslation()

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

          {props.openAddressBook && (
            <SAddressBookButton type="button" onClick={props.openAddressBook}>
              <Text fs={11} lh={11} color="darkBlue100">
                {t("wallet.assets.transfer.dest.addressBook")}
              </Text>
              <IconWalletSmall />
            </SAddressBookButton>
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
